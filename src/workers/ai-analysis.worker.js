
const { Worker } = require("bullmq");
const redis = require("../config/redis");
const connectDB = require("../config/database");
const processAIAnalysisJob = require("./ai-analysis.processor");

async function startWorker() {
  try {
    await connectDB();

    const aiAnalysisWorker = new Worker(
      "ai-incident-analysis",
      (job) => processAIAnalysisJob(job),
      {
        connection: redis,
        concurrency: 2,
      }
    );

    aiAnalysisWorker.on("completed", (job) => {
      console.log(`AI analysis completed for job: ${job.id}`);
    });

    aiAnalysisWorker.on("failed", (job, error) => {
      console.error(
        `AI analysis job ${job?.id} failed:`,
        error.message
      );
    });

    aiAnalysisWorker.on("error", (error) => {
      console.error("AI worker error:", error.message);
    });

    console.log("AI analysis worker started successfully");
  } catch (error) {
    console.error("Failed to start AI analysis worker:", error.message);
    await redis.quit().catch(() => {});
    process.exit(1);
  }
}

startWorker();
