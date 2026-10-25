
const test = require("node:test");
const assert = require("node:assert/strict");

const Incident = require("../src/models/incident.model");
const createAIAnalysisQueueService = require(
  "../src/services/ai-analysis-queue.service"
);

test("enqueues an incident and persists its job ID", async (t) => {
  const originalFindByIdAndUpdate = Incident.findByIdAndUpdate;
  const updates = [];
  const addedJobs = [];

  Incident.findByIdAndUpdate = async (id, update) => {
    updates.push({ id: String(id), update });
    return { _id: id };
  };

  t.after(() => {
    Incident.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  const queue = {
    add: async (name, data) => {
      addedJobs.push({ name, data });
      return { id: "job-123" };
    },
  };

  const enqueueAIAnalysis = createAIAnalysisQueueService(queue);

  const incident = {
    _id: "incident-123",
    title: "API unavailable",
    description: "The API is returning errors",
    service: "payment-api",
    severity: "high",
  };

  const result = await enqueueAIAnalysis(incident);

  assert.deepEqual(result, { jobId: "job-123" });

  assert.equal(addedJobs.length, 1);
  assert.equal(addedJobs[0].name, "analyze-incident");
  assert.equal(addedJobs[0].data.incidentId, "incident-123");
  assert.equal(addedJobs[0].data.title, "API unavailable");

  assert.equal(updates.length, 1);
  assert.equal(updates[0].id, "incident-123");
  assert.equal(
    updates[0].update.$set["aiAnalysis.jobId"],
    "job-123"
  );
  assert.equal(
    updates[0].update.$set["aiAnalysis.status"],
    "pending"
  );
});


test("removes the queued job when saving its ID to MongoDB fails", async (t) => {
  const originalFindByIdAndUpdate = Incident.findByIdAndUpdate;
  const expectedError = new Error("MongoDB unavailable");
  let removeCalled = false;

  Incident.findByIdAndUpdate = async () => {
    throw expectedError;
  };

  t.after(() => {
    Incident.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  const queue = {
    add: async () => ({
      id: "job-456",
      remove: async () => {
        removeCalled = true;
      },
    }),
  };

  const enqueueAIAnalysis = createAIAnalysisQueueService(queue);

  const incident = {
    _id: "incident-123",
    title: "API unavailable",
    description: "The API is returning errors",
    service: "payment-api",
    severity: "high",
  };

  await assert.rejects(
    enqueueAIAnalysis(incident),
    (error) => error === expectedError
  );

  assert.equal(removeCalled, true);
});
