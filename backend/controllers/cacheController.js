const { redisClient } = require("../config/redis");

async function getCacheStatus(req, res) {
    try {
        const keys = await redisClient.keys("*");

        const cacheData = [];

        for (const key of keys) {
            const value = await redisClient.get(key);
            const ttl = await redisClient.ttl(key);

            cacheData.push({
                key,
                value,
                ttl
            });
        }

        res.json({
            success: true,
            count: cacheData.length,
            data: cacheData
        });

    } catch (error) {
        console.error("Cache status error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch cache information."
        });
    }
}


async function clearCache(req, res) {
    try {
        await redisClient.flushDb();

        console.log("[Analytics] User interacted with Redis Caching");

        res.json({
            success: true,
            message: "Redis cache cleared successfully."
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Unable to clear cache."
        });
    }
}


module.exports = {
    getCacheStatus,
    clearCache
};