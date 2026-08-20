const pool = require("../config/db");
const { redisClient } = require("../config/redis");

const CACHE_TTL = 60;

async function getProperties(req, res) {
    try {
        const search = req.query.search || "";

        const cacheKey = search
            ? `properties:search:${search.toLowerCase()}`
            : "properties:all";

        // Check Redis
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log("[Redis] Cache HIT");

            return res.json({
                success: true,
                source: "redis",
                data: JSON.parse(cachedData)
            });
        }

        console.log("[Redis] Cache MISS");

        let query;
        let values = [];

        if (search) {
            query = `
                SELECT *
                FROM properties
                WHERE LOWER(title) LIKE LOWER($1)
                   OR LOWER(location) LIKE LOWER($1)
                ORDER BY id DESC
            `;

            values = [`%${search}%`];
        } else {
            query = `
                SELECT *
                FROM properties
                ORDER BY id DESC
            `;
        }

        const result = await pool.query(query, values);

        // Save in Redis
        await redisClient.setEx(
            cacheKey,
            CACHE_TTL,
            JSON.stringify(result.rows)
        );

        res.json({
            success: true,
            source: "database",
            data: result.rows
        });

    } catch (error) {
        console.error("Get properties error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch properties."
        });
    }
}


async function getPropertyById(req, res) {
    try {
        const { id } = req.params;

        const cacheKey = `property:${id}`;

        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log("[Redis] Cache HIT");

            return res.json({
                success: true,
                source: "redis",
                data: JSON.parse(cachedData)
            });
        }

        const result = await pool.query(
            "SELECT * FROM properties WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found."
            });
        }

        const property = result.rows[0];

        await redisClient.setEx(
            cacheKey,
            CACHE_TTL,
            JSON.stringify(property)
        );

        res.json({
            success: true,
            source: "database",
            data: property
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch property."
        });
    }
}


async function createProperty(req, res) {
    try {
        const { title, location, price, status } = req.body;

        const result = await pool.query(
            `
            INSERT INTO properties
            (title, location, price, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [title, location, price, status]
        );

        // Invalidate list cache
        await redisClient.del("properties:all");

        console.log("[Analytics] User interacted with Redis Caching");

        res.status(201).json({
            success: true,
            message: "Property created successfully.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Unable to create property."
        });
    }
}


async function updateProperty(req, res) {
    try {
        const { id } = req.params;
        const { title, location, price, status } = req.body;

        const result = await pool.query(
            `
            UPDATE properties
            SET title = $1,
                location = $2,
                price = $3,
                status = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
            `,
            [title, location, price, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found."
            });
        }

        await redisClient.del(`property:${id}`);
        await redisClient.del("properties:all");

        res.json({
            success: true,
            message: "Property updated successfully.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update property."
        });
    }
}


async function deleteProperty(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM properties WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found."
            });
        }

        await redisClient.del(`property:${id}`);
        await redisClient.del("properties:all");

        res.json({
            success: true,
            message: "Property deleted successfully."
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Unable to delete property."
        });
    }
}


module.exports = {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
};