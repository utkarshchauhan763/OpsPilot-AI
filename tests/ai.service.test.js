
const { test } = require("node:test");
const assert = require("node:assert/strict");

const { analyzeIncident } = require("../src/services/ai.service");

const sampleIncident = {
  title: "API returning HTTP 500",
  description: "The API returns internal server errors intermittently.",
  service: "Payment API",
  severity: "high",
};

test("analyzeIncident returns the AI analysis", async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      response: "Likely cause: an unhandled server exception.",
    }),
  });

  try {
    const result = await analyzeIncident(sampleIncident);

    assert.equal(result.model, "llama3.2:3b");
    assert.match(result.analysis, /unhandled server exception/i);
  } finally {
    global.fetch = originalFetch;
  }
});

test("analyzeIncident rejects missing incident details", async () => {
  await assert.rejects(
    analyzeIncident({ title: "API failure" }),
    /Incident details are required/
  );
});

test("analyzeIncident handles Ollama HTTP errors", async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  try {
    await assert.rejects(
      analyzeIncident(sampleIncident),
      /Ollama request failed with status 500/
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test("analyzeIncident handles Ollama connection failures", async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => {
    throw new Error("Connection refused");
  };

  try {
    await assert.rejects(
      analyzeIncident(sampleIncident),
      /Unable to connect to Ollama/
    );
  } finally {
    global.fetch = originalFetch;
  }
});
