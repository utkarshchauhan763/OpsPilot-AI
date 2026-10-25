
const test = require("node:test");
const assert = require("node:assert/strict");

const Incident = require("../src/models/incident.model");
const createAIAnalysisStatusHandler = require(
  "../src/controllers/ai-analysis-status.handler"
);

const originalFindById = Incident.findById;
const originalFindOne = Incident.findOne;

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

test("returns completed job status and persisted analysis", async (t) => {
  Incident.findById = () => ({
    select() {
      return this;
    },
    lean: async () => ({
      aiAnalysis: {
        status: "completed",
        model: "llama3.2:3b",
        result: "The service may be overloaded.",
        completedAt: new Date("2026-10-25T04:00:00.000Z"),
      },
    }),
  });

  t.after(() => {
    Incident.findById = originalFindById;
  });

  const handler = createAIAnalysisStatusHandler({
    getJobById: async () => ({
      id: "5",
      data: { incidentId: "incident-1" },
      getState: async () => "completed",
    }),
  });

  const res = createResponse();

  await handler({ params: { jobId: "5" } }, res, assert.fail);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, "completed");
  assert.equal(res.body.data.analysisStatus, "completed");
  assert.equal(
    res.body.data.result.analysis,
    "The service may be overloaded."
  );
});

test("returns 404 when neither the BullMQ job nor saved analysis exists", async (t) => {
  Incident.findOne = () => ({
    select() {
      return this;
    },
    lean: async () => null,
  });

  t.after(() => {
    Incident.findOne = originalFindOne;
  });

  const handler = createAIAnalysisStatusHandler({
    getJobById: async () => null,
  });

  const res = createResponse();

  await handler(
    { params: { jobId: "999" } },
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "AI analysis job not found");
});

test("forwards queue errors to Express error middleware", async (t) => {
  Incident.findById = originalFindById;

  const expectedError = new Error("Redis unavailable");

  const handler = createAIAnalysisStatusHandler({
    getJobById: async () => {
      throw expectedError;
    },
  });

  const res = createResponse();
  let forwardedError;

  await handler(
    { params: { jobId: "5" } },
    res,
    (error) => {
      forwardedError = error;
    }
  );

  assert.equal(forwardedError, expectedError);
});


test("returns saved analysis when the BullMQ job has been removed", async (t) => {
  const originalFindOne = Incident.findOne;

  Incident.findOne = (query) => {
    assert.deepEqual(query, {
      "aiAnalysis.jobId": "job-123",
    });

    return {
      select() {
        return this;
      },
      lean: async () => ({
        _id: "incident-456",
        aiAnalysis: {
          jobId: "job-123",
          status: "completed",
          model: "llama3.2:3b",
          result: "The service may be overloaded.",
          completedAt: new Date("2026-10-25T04:00:00.000Z"),
        },
      }),
    };
  };

  t.after(() => {
    Incident.findOne = originalFindOne;
  });

  const handler = createAIAnalysisStatusHandler({
    getJobById: async () => null,
  });

  const res = createResponse();

  await handler(
    { params: { jobId: "job-123" } },
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.jobId, "job-123");
  assert.equal(res.body.data.incidentId, "incident-456");
  assert.equal(res.body.data.status, "completed");
  assert.equal(
    res.body.data.result.analysis,
    "The service may be overloaded."
  );
});
