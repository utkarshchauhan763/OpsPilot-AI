
const test = require("node:test");
const assert = require("node:assert/strict");

const Incident = require("../src/models/incident.model");
const processAIAnalysisJob = require("../src/workers/ai-analysis.processor");

const originalFindByIdAndUpdate = Incident.findByIdAndUpdate;

test("saves a successful AI analysis to the incident", async (t) => {
  const updates = [];

  Incident.findByIdAndUpdate = async (id, update) => {
    updates.push({ id, update });
    return { _id: id };
  };

  t.after(() => {
    Incident.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  const job = {
    id: "job-1",
    data: {
      incidentId: "incident-1",
      title: "API unavailable",
      description: "The API returns HTTP 503 errors",
      service: "payment-api",
      severity: "high",
    },
  };

  const result = await processAIAnalysisJob(job, async () => ({
    model: "llama3.2:3b",
    analysis: "The service may be overloaded.",
  }));

  assert.equal(result.incidentId, "incident-1");
  assert.equal(result.model, "llama3.2:3b");
  assert.equal(result.analysis, "The service may be overloaded.");

  assert.equal(updates.length, 2);
  assert.equal(
    updates[0].update.$set["aiAnalysis.status"],
    "pending"
  );
  assert.equal(
    updates[1].update.$set["aiAnalysis.status"],
    "completed"
  );
  assert.equal(
    updates[1].update.$set["aiAnalysis.result"],
    "The service may be overloaded."
  );
  assert.ok(
    updates[1].update.$set["aiAnalysis.completedAt"] instanceof Date
  );
});

test("marks AI analysis as failed and rethrows analysis errors", async (t) => {
  const updates = [];
  const expectedError = new Error("Ollama unavailable");

  Incident.findByIdAndUpdate = async (id, update) => {
    updates.push({ id, update });
    return { _id: id };
  };

  t.after(() => {
    Incident.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  const job = {
    id: "job-2",
    data: {
      incidentId: "incident-2",
      title: "Database timeout",
      description: "Database requests are timing out",
      service: "database",
      severity: "critical",
    },
  };

  await assert.rejects(
    processAIAnalysisJob(job, async () => {
      throw expectedError;
    }),
    (error) => error === expectedError
  );

  assert.equal(updates.length, 2);
  assert.equal(
    updates[0].update.$set["aiAnalysis.status"],
    "pending"
  );
  assert.equal(
    updates[1].update.$set["aiAnalysis.status"],
    "failed"
  );
  assert.equal(
    updates[1].update.$set["aiAnalysis.error"],
    "AI analysis failed"
  );
});
