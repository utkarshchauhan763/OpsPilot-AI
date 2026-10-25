const { Worker } = require("bullmq");
const redis = require("../config/redis");
const processAIAnalysisJob = require("./ai-analysis.processor");

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

aiAnalysisWorker.on("failed",(job,error)=>{
    console.error(
        `Ai analysis job ${job?.id} failed:`,
        error.message
    );
});

aiAnalysisWorker.on("error",(error)=>{
    console.error("Ai worker error:", error.message);
});
module.exports = aiAnalysisWorker;