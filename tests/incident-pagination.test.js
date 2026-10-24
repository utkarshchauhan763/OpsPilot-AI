
const test = require("node:test");
const assert = require("node:assert/strict");

const buildPagination = require("../src/utils/pagination");

test("uses default pagination values", () => {
  assert.deepEqual(buildPagination({}), {
    page: 1,
    limit: 10,
    skip: 0,
  });
});

test("calculates skip for a custom page", () => {
  assert.deepEqual(buildPagination({ page: "3", limit: "5" }), {
    page: 3,
    limit: 5,
    skip: 10,
  });
});

test("rejects an invalid page number", () => {
  const result = buildPagination({ page: "0" });

  assert.equal(
    result.error,
    "Page must be a positive integer and limit must be between 1 and 100"
  );
});

test("rejects a limit greater than 100", () => {
  const result = buildPagination({ limit: "101" });

  assert.equal(
    result.error,
    "Page must be a positive integer and limit must be between 1 and 100"
  );
});

test("rejects a non-numeric page", () => {
  const result = buildPagination({ page: "abc" });

  assert.equal(
    result.error,
    "Page must be a positive integer and limit must be between 1 and 100"
  );
});

test("rejects a zero limit", () => {
  const result = buildPagination({ limit: "0" });

  assert.equal(
    result.error,
    "Page must be a positive integer and limit must be between 1 and 100"
  );
});

test("accepts the maximum limit of 100", () => {
  assert.deepEqual(buildPagination({ page: "1", limit: "100" }), {
    page: 1,
    limit: 100,
    skip: 0,
  });
});
