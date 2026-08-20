// MOCKED Redis client — in-memory store for AI Studio environment
class InMemoryRedis {
    constructor() {
        this.store = new Map();
        this.isOpen = false;
        this.listeners = {
            connect: [],
            error: []
        };
    }

    on(event, handler) {
        if (this.listeners[event]) {
            this.listeners[event].push(handler);
        }
    }

    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(fn => fn(...args));
        }
    }

    async connect() {
        this.isOpen = true;
        console.log("[AI Studio] In-Memory Redis connected");
        setTimeout(() => this.emit("connect"), 0);
        return true;
    }

    async get(key) {
        const item = this.store.get(key);
        if (!item) return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async set(key, value) {
        this.store.set(key, { value: String(value), expiresAt: null, createdAt: Date.now() });
        return "OK";
    }

    async setEx(key, ttlSeconds, value) {
        this.store.set(key, {
            value: String(value),
            expiresAt: Date.now() + ttlSeconds * 1000,
            ttlSeconds,
            createdAt: Date.now()
        });
        return "OK";
    }

    async del(key) {
        const deleted = this.store.delete(key);
        return deleted ? 1 : 0;
    }

    async keys(pattern = "*") {
        const now = Date.now();
        const activeKeys = [];
        for (const [key, item] of this.store.entries()) {
            if (item.expiresAt && now > item.expiresAt) {
                this.store.delete(key);
            } else {
                activeKeys.push(key);
            }
        }
        return activeKeys;
    }

    async ttl(key) {
        const item = this.store.get(key);
        if (!item) return -2;
        if (!item.expiresAt) return -1;
        const remainingMs = item.expiresAt - Date.now();
        if (remainingMs <= 0) {
            this.store.delete(key);
            return -2;
        }
        return Math.ceil(remainingMs / 1000);
    }

    async flushDb() {
        this.store.clear();
        return "OK";
    }
}

const redisClient = new InMemoryRedis();

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

module.exports = {
    redisClient,
    connectRedis
};
