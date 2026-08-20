const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("connect", () => {
    console.log("Redis connected");
});

redisClient.on("error", (error) => {
    console.error("Redis error:", error.message);
});

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

module.exports = {
    redisClient,
    connectRedis
};