
const test = require("node:test");
const assert = require("node:assert/strict");

const createAIAnalysisQueueService = require("../src/services/ai-analysis-queue.service");

test("enqueues an incident with the required analysis data", async () => {
  let capturedJobName;
  let capturedJobData;

  const mockQueue = {
    add: async (name, data) => {
      capturedJobName = name;
      capturedJobData = data;

      return { id: "job-123" };
    },
  };

  const enqueueAIAnalysis = createAIAnalysisQueueService(mockQueue);

  const incident = {
    _id: "incident-123",
    title: "API returning HTTP 500",
    description: "Requests are failing",
    service: "payment-api",
    severity: "high",
  };

  const result = await enqueueAIAnalysis(incident);

  assert.equal(capturedJobName, "analyze-incident");
  assert.deepEqual(capturedJobData, {
    incidentId: "incident-123",
    title: "API returning HTTP 500",
    description: "Requests are failing",
    service: "payment-api",
    severity: "high",
  });
  assert.deepEqual(result, { jobId: "job-123" });
});
