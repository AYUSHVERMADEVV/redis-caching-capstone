// PostgreSQL database client with robust in-memory mock fallback for AI Studio
const { Pool } = require("pg");

let nextId = 4;
let mockProperties = [
    {
        id: 1,
        title: "2 BHK Apartment",
        location: "Varanasi",
        price: "2500000.00",
        status: "available",
        created_at: new Date("2025-01-01T00:00:00Z").toISOString(),
        updated_at: new Date("2025-01-01T00:00:00Z").toISOString()
    },
    {
        id: 2,
        title: "3 BHK Villa",
        location: "Lucknow",
        price: "5500000.00",
        status: "available",
        created_at: new Date("2025-01-02T00:00:00Z").toISOString(),
        updated_at: new Date("2025-01-02T00:00:00Z").toISOString()
    },
    {
        id: 3,
        title: "1 BHK Flat",
        location: "Delhi",
        price: "1800000.00",
        status: "sold",
        created_at: new Date("2025-01-03T00:00:00Z").toISOString(),
        updated_at: new Date("2025-01-03T00:00:00Z").toISOString()
    }
];

class MockPool {
    constructor() {
        console.log("[AI Studio] Using in-memory PostgreSQL store");
    }

    on(event, handler) {
        if (event === "connect") {
            setTimeout(handler, 0);
        }
    }

    async query(queryText, values = []) {
        const text = queryText.trim().replace(/\s+/g, " ");

        // Search properties
        if (text.includes("LOWER(title) LIKE LOWER($1)") || text.includes("LIKE LOWER($1)")) {
            const rawTerm = (values[0] || "").replace(/%/g, "").toLowerCase();
            const filtered = mockProperties
                .filter(p => (p.title && p.title.toLowerCase().includes(rawTerm)) || (p.location && p.location.toLowerCase().includes(rawTerm)))
                .sort((a, b) => b.id - a.id);
            return { rows: filtered, rowCount: filtered.length };
        }

        // Get single property by ID
        if (text.includes("SELECT") && text.includes("WHERE id = $1")) {
            const targetId = Number(values[0]);
            const item = mockProperties.find(p => p.id === targetId);
            return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
        }

        // Get all properties
        if (text.includes("SELECT") && text.includes("FROM properties")) {
            const sorted = [...mockProperties].sort((a, b) => b.id - a.id);
            return { rows: sorted, rowCount: sorted.length };
        }

        // Insert property
        if (text.includes("INSERT INTO properties")) {
            const [title, location, price, status] = values;
            const newProperty = {
                id: nextId++,
                title,
                location,
                price: Number(price).toFixed(2),
                status: status || "available",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockProperties.push(newProperty);
            return { rows: [newProperty], rowCount: 1 };
        }

        // Update property
        if (text.includes("UPDATE properties")) {
            const targetId = Number(values[values.length - 1]);
            const [title, location, price, status] = values;
            const index = mockProperties.findIndex(p => p.id === targetId);
            if (index === -1) {
                return { rows: [], rowCount: 0 };
            }
            const updated = {
                ...mockProperties[index],
                title: title !== undefined ? title : mockProperties[index].title,
                location: location !== undefined ? location : mockProperties[index].location,
                price: price !== undefined ? Number(price).toFixed(2) : mockProperties[index].price,
                status: status || mockProperties[index].status,
                updated_at: new Date().toISOString()
            };
            mockProperties[index] = updated;
            return { rows: [updated], rowCount: 1 };
        }

        // Delete property
        if (text.includes("DELETE FROM properties")) {
            const targetId = Number(values[0]);
            const index = mockProperties.findIndex(p => p.id === targetId);
            if (index === -1) {
                return { rows: [], rowCount: 0 };
            }
            const removed = mockProperties.splice(index, 1);
            return { rows: removed, rowCount: 1 };
        }

        // Default
        return { rows: [], rowCount: 0 };
    }
}

const mockPoolInstance = new MockPool();

// Smart pool wrapper that handles real database if available or falls back to mock
let realPool = null;
let useRealDb = false;

if (process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1" && process.env.DB_NAME) {
    try {
        realPool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionTimeoutMillis: 3000
        });
        useRealDb = true;
    } catch (e) {
        console.warn("Failed to initialize real PostgreSQL pool:", e.message);
        useRealDb = false;
    }
}

const pool = {
    on: (event, handler) => {
        if (useRealDb && realPool) {
            realPool.on(event, handler);
        } else {
            mockPoolInstance.on(event, handler);
        }
    },
    query: async (text, values) => {
        if (useRealDb && realPool) {
            try {
                return await realPool.query(text, values);
            } catch (err) {
                console.warn("[PostgreSQL] Query failed on real database, falling back to mock:", err.message);
                return await mockPoolInstance.query(text, values);
            }
        }
        return await mockPoolInstance.query(text, values);
    }
};

module.exports = pool;
