
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");

const { createHealthRouter } = require("../src/routes/health.routes");
const app = require("../src/app");

function createHealthTestApp({ readyState, ping }) {
    const testApp = express();
    testApp.use("/health", createHealthRouter({
        connection: { readyState },
        redisClient: { ping },
    }));
    return testApp;
}

test("GET /health should return healthy when MongoDB and Redis are connected", async () => {
    const response = await request(createHealthTestApp({
        readyState: 1,
        ping: async () => "PONG",
    })).get("/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.status, "healthy");
    assert.equal(response.body.service, "OpsPilot AI");
    assert.equal(response.body.dependencies.mongodb, "connected");
    assert.equal(response.body.dependencies.redis, "connected");
    assert.ok(response.body.timestamp);
});

test("GET /health should return unhealthy when MongoDB is disconnected", async () => {
    const response = await request(createHealthTestApp({
        readyState: 0,
        ping: async () => "PONG",
    })).get("/health");

    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.equal(response.body.status, "unhealthy");
    assert.equal(response.body.dependencies.mongodb, "disconnected");
    assert.equal(response.body.dependencies.redis, "connected");
});

test("GET /health should return unhealthy when Redis is unavailable", async () => {
    const response = await request(createHealthTestApp({
        readyState: 1,
        ping: async () => {
            throw new Error("Redis unavailable");
        },
    })).get("/health");

    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.equal(response.body.status, "unhealthy");
    assert.equal(response.body.dependencies.mongodb, "connected");
    assert.equal(response.body.dependencies.redis, "disconnected");
});

test("GET / should return the server welcome message", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(
        response.body.message,
        "OpsPilot AI server is running"
    );
});

test("GET /invalid-route should return 404", async () => {
    const response = await request(app).get("/invalid-route");

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
    assert.equal(
        response.body.message,
        "Route GET /invalid-route not found"
    );
});
