
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

test("POST /incidents should reject a missing title", async () => {
  const response = await request(app)
    .post("/incidents")
    .send({
      description: "Database connection timeout",
      service: "payment-api",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Invalid incident data");
});

test("POST /incidents should reject an invalid severity", async () => {
  const response = await request(app)
    .post("/incidents")
    .send({
      title: "Payment API failure",
      description: "Database connection timeout",
      service: "payment-api",
      severity: "urgent",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Invalid incident data");
});

