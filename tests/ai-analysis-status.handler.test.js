
const test = require("node:test");
const assert = require("node:assert/strict");

const createAIAnalysisStatusHandler = require(
  "../src/controllers/ai-analysis-status.handler"
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

test("returns a completed job with its AI analysis", async () => {
  const job = {
    id: "5",
    data: {
      incidentId: "6adc4d05e9221f454bf743cf",
    },
    getState: async () => "completed",
    returnvalue: {
      incidentId: "6adc4d05e9221f454bf743cf",
      model: "llama3.2:3b",
      analysis: "The cause may be an application error.",
    },
  };

  const handler = createAIAnalysisStatusHandler({
    getJobById: async (jobId) => {
      assert.equal(jobId, "5");
      return job;
    },
  });

  const res = createResponse();

  await handler({ params: { jobId: "5" } }, res, assert.fail);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, "completed");
  assert.deepEqual(res.body.data.result, job.returnvalue);
});

test("returns 404 when the job does not exist", async () => {
  const handler = createAIAnalysisStatusHandler({
    getJobById: async () => null,
  });

  const res = createResponse();

  await handler({ params: { jobId: "999" } }, res, assert.fail);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "AI analysis job not found");
});

test("forwards queue errors to Express error middleware", async () => {
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
