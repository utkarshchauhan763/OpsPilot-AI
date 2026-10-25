
const express = require("express");
const mongoose = require("mongoose");
const redis = require("../config/redis");

function createHealthRouter({
    connection = mongoose.connection,
    redisClient = redis,
} = {}) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        let redisConnected = false;

        const mongoConnected = connection.readyState === 1;

        try {
            redisConnected = (await redisClient.ping()) === "PONG";
        } catch (error) {
            redisConnected = false;
        }

        const healthy = mongoConnected && redisConnected;

        return res.status(healthy ? 200 : 503).json({
            success: healthy,
            status: healthy ? "healthy" : "unhealthy",
            service: "OpsPilot AI",
            dependencies: {
                mongodb: mongoConnected ? "connected" : "disconnected",
                redis: redisConnected ? "connected" : "disconnected",
            },
            timestamp: new Date().toISOString(),
        });
    });

    return router;
}

module.exports = createHealthRouter();
module.exports.createHealthRouter = createHealthRouter;
