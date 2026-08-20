require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const propertyRoutes = require("./routes/propertyRoutes");
const cacheRoutes = require("./routes/cacheRoutes");

const { connectRedis } = require("./config/redis");

const app = express();

const PORT = 3000;

// Security (disable restrictive CSP for local static scripts)
app.use(helmet({
    contentSecurityPolicy: false
}));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/cache", cacheRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Redis Caching API is running."
    });
});

// Serve frontend static assets from root directory
app.use(express.static(path.join(__dirname, "..")));

// Fallback for non-API routes
app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message: "API endpoint not found."
        });
    }
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Global error handler
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

async function startServer() {
    try {
        await connectRedis();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

if (require.main === module || !process.env.VERCEL) {
    startServer();
}

module.exports = app;

