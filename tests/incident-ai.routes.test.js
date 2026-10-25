
const test = require("node:test");
const assert = require("node:assert/strict");

const createAnalyzeIncidentHandler = require("../src/controllers/incident-ai.handler");

function createResponse() {
  return {
    statusCode: 200,
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

function createMocks({ incident = null, analysis } = {}) {
  const mocks = {
    findIncidentById: async () => incident,
    analyzeIncident: async () =>
      analysis || {
        model: "llama3.2:3b",
        analysis: "Likely cause: a database connection failure.",
      },
  };

  return {
    mocks,
    handler: createAnalyzeIncidentHandler(mocks),
  };
}

test("rejects an invalid incident ID", async () => {
  const { handler, mocks } = createMocks();
  const req = { params: { id: "invalid-id" } };
  const res = createResponse();
  let forwardedError;

  await handler(req, res, (error) => {
    forwardedError = error;
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid incident ID");
  assert.equal(forwardedError, undefined);
});

test("returns 404 when the incident does not exist", async () => {
  const { handler } = createMocks({ incident: null });
  const req = { params: { id: "507f1f77bcf86cd799439011" } };
  const res = createResponse();

  await handler(req, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Incident not found");
});

test("returns AI analysis for an existing incident", async () => {
  const incident = {
    _id: "507f1f77bcf86cd799439011",
    title: "Payment API failure",
    description: "Database connections are timing out.",
    service: "payment-api",
    severity: "high",
  };

  const { handler, mocks } = createMocks({ incident });
  const req = { params: { id: incident._id } };
  const res = createResponse();

  await handler(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.incidentId, incident._id);
  assert.equal(res.body.data.model, "llama3.2:3b");
  assert.match(res.body.data.analysis, /database connection failure/i);
});

test("forwards AI service errors to error middleware", async () => {
  const incident = {
    _id: "507f1f77bcf86cd799439011",
    title: "Payment API failure",
    description: "Database connections are timing out.",
    service: "payment-api",
    severity: "high",
  };

  const { handler } = createMocks({ incident });
  const expectedError = new Error("Unable to connect to Ollama");

  const mocks = createMocks({
    incident,
  }).mocks;

  mocks.analyzeIncident = async () => {
    throw expectedError;
  };

  const errorHandler = createAnalyzeIncidentHandler(mocks);
  const res = createResponse();
  let forwardedError;

  await errorHandler(
    { params: { id: incident._id } },
    res,
    (error) => {
      forwardedError = error;
    }
  );

  assert.equal(forwardedError, expectedError);
});
