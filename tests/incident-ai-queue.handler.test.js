
const test = require("node:test");
const assert = require("node:assert/strict");

const createQueuedAnalysisHandler = require(
  "../src/controllers/incident-ai-queue.handler"
);

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

function createMocks(overrides = {}) {
  return {
    findIncidentById: async () => ({
      _id: "507f1f77bcf86cd799439011",
      title: "API returning HTTP 500",
      description: "Requests are failing",
      service: "payment-api",
      severity: "high",
    }),
    enqueueAIAnalysis: async () => ({
      jobId: "job-123",
    }),
    ...overrides,
  };
}

test("rejects an invalid incident ID", async () => {
  const mocks = createMocks();
  const handler = createQueuedAnalysisHandler(mocks);
  const res = createResponse();

  await handler({ params: { id: "invalid" } }, res, assert.fail);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid incident ID");
});

test("returns 404 when the incident does not exist", async () => {
  const mocks = createMocks({
    findIncidentById: async () => null,
  });
  const handler = createQueuedAnalysisHandler(mocks);
  const res = createResponse();

  await handler(
    { params: { id: "507f1f77bcf86cd799439011" } },
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 404);
});

test("queues an existing incident and returns 202", async () => {
  let queuedIncident;

  const mocks = createMocks({
    enqueueAIAnalysis: async (incident) => {
      queuedIncident = incident;
      return { jobId: "job-123" };
    },
  });

  const handler = createQueuedAnalysisHandler(mocks);
  const res = createResponse();

  await handler(
    { params: { id: "507f1f77bcf86cd799439011" } },
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 202);
  assert.equal(queuedIncident.title, "API returning HTTP 500");
  assert.equal(res.body.data.jobId, "job-123");
  assert.equal(res.body.data.status, "queued");
});

test("forwards queue errors to Express error middleware", async () => {
  const expectedError = new Error("Redis unavailable");
  const mocks = createMocks({
    enqueueAIAnalysis: async () => {
      throw expectedError;
    },
  });

  const handler = createQueuedAnalysisHandler(mocks);
  const res = createResponse();
  let forwardedError;

  await handler(
    { params: { id: "507f1f77bcf86cd799439011" } },
    res,
    (error) => {
      forwardedError = error;
    }
  );

  assert.equal(forwardedError, expectedError);
});
