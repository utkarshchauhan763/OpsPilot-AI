
const test = require("node:test");
const assert = require("node:assert/strict");
const Incident = require("../src/models/incident.model");

test("should accept a valid incident", async () => {
  const incident = new Incident({
    title: "Payment API failure",
    description: "Database connection timeout",
    service: "payment-api",
    severity: "critical",
    source: "monitoring",
  });

  await assert.doesNotReject(incident.validate());
});

test("should reject an incident without a title", async () => {
  const incident = new Incident({
    description: "Database connection timeout",
    service: "payment-api",
  });

  await assert.rejects(
    incident.validate(),
    (error) => {
      assert.equal(error.name, "ValidationError");
      assert.ok(error.errors.title);
      return true;
    }
  );
});

test("should reject an invalid severity", async () => {
  const incident = new Incident({
    title: "Payment API failure",
    description: "Database connection timeout",
    service: "payment-api",
    severity: "urgent",
  });

  await assert.rejects(
    incident.validate(),
    (error) => {
      assert.equal(error.name, "ValidationError");
      assert.ok(error.errors.severity);
      return true;
    }
  );
});

test("should apply default values", async () => {
  const incident = new Incident({
    title: "Payment API failure",
    description: "Database connection timeout",
    service: "payment-api",
  });

  await incident.validate();

  assert.equal(incident.severity, "medium");
  assert.equal(incident.status, "open");
  assert.equal(incident.source, "manual");
});
