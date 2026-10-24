
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("PATCH /incidents/:id should reject an invalid incident ID", async () => {
  const response = await request(app)
    .patch("/incidents/invalid-id")
    .send({ status: "investigating" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Invalid incident ID");
});

test("PATCH /incidents/:id should reject an empty update", async () => {
  const response = await request(app)
    .patch("/incidents/671a12345678901234567890")
    .send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(
    response.body.message,
    "Provide at least one field to update"
  );
});

test("PATCH /incidents/:id should reject fields that cannot be updated", async () => {
  const response = await request(app)
    .patch("/incidents/671a12345678901234567890")
    .send({ title: "Changed incident title" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(
    response.body.message,
    "Only these fields can be updated: status, severity"
  );
});

test("PATCH /incidents/:id should reject an array as the update body", async () => {
  const response = await request(app)
    .patch("/incidents/671a12345678901234567890")
    .send([{ status: "resolved" }]);

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(
    response.body.message,
    "Provide at least one field to update"
  );
});
