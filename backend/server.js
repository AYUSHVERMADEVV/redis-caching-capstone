require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const propertyRoutes = require("./routes/propertyRoutes");
const cacheRoutes = require("./routes/cacheRoutes");

const { connectRedis } = require("./config/redis");

const app = express();

const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/cache", cacheRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Redis Caching API is running."
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
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

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();