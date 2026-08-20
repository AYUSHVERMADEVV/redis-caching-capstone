const express = require("express");

const {
    getCacheStatus,
    clearCache
} = require("../controllers/cacheController");

const router = express.Router();

router.get("/", getCacheStatus);

router.delete("/", clearCache);

module.exports = router;