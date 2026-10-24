const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("GET /health should return a healthy status", async() =>{
    const response = await request(app).get("/health");
    assert.equal(response.status,200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.status, "healthy");
    assert.equal(response.body.service, "OpsPilot AI");
    assert.ok(response.body.timestamp);
})

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
