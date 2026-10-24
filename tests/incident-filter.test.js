
const test = require("node:test");
const assert = require("node:assert/strict");
const buildIncidentFilter = require("../src/utils/incident-filter");

test("should build a filter using severity and status", () => {
  const result = buildIncidentFilter({
    severity: "critical",
    status: "open",
  });

  assert.deepEqual(result, {
    filter: {
      severity: "critical",
      status: "open",
    },
  });
});

test("should reject an invalid severity", () => {
  const result = buildIncidentFilter({ severity: "urgent" });

  assert.equal(result.error, "Invalid severity filter");
});

test("should reject an invalid status", () => {
  const result = buildIncidentFilter({ status: "pending" });

  assert.equal(result.error, "Invalid status filter");
});

test("should trim the service name", () => {
  const result = buildIncidentFilter({
    service: " payment-api ",
  });

  assert.deepEqual(result, {
    filter: { service: "payment-api" },
  });
});

test("should return an empty filter when no filters are supplied", () => {
  const result = buildIncidentFilter({});

  assert.deepEqual(result, { filter: {} });
});
