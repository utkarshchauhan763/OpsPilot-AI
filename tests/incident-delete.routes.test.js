
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("DELETE /incidents/:id should reject an invalid incident ID", async () => {
  const response = await request(app)
    .delete("/incidents/invalid-id");

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Invalid incident ID");
});

test("DELETE /incidents/:id should reject a malformed ObjectId", async () => {
  const response = await request(app)
    .delete("/incidents/12345678901234567890123g");

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Invalid incident ID");
});
