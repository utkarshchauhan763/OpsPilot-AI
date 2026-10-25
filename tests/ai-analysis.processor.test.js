
const test = require("node:test");
const assert = require("node:assert/strict");

const processAIAnalysisJob = require("../src/workers/ai-analysis.processor");

test("processes a job and returns the incident analysis", async () => {
  let receivedIncident;

  const job = {
    id: "job-123",
    data: {
      incidentId: "incident-123",
      title: "API returning HTTP 500",
      description: "Requests are failing",
      service: "payment-api",
      severity: "high",
    },
  };

  const mockAnalyze = async (incident) => {
    receivedIncident = incident;

    return {
      model: "test-model",
      analysis: "The cause may be an application error.",
    };
  };

  const result = await processAIAnalysisJob(job, mockAnalyze);

  assert.deepEqual(receivedIncident, {
    title: "API returning HTTP 500",
    description: "Requests are failing",
    service: "payment-api",
    severity: "high",
  });

  assert.deepEqual(result, {
    incidentId: "incident-123",
    model: "test-model",
    analysis: "The cause may be an application error.",
  });
});

test("propagates AI service failures so BullMQ can retry", async () => {
  const expectedError = new Error("Unable to connect to Ollama");

  const job = {
    id: "job-456",
    data: {
      incidentId: "incident-456",
      title: "Database unavailable",
      description: "Database connections are failing",
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
});
