const { Queue } = require("bullmq");
const redis = require("../config/redis");
const aiAnalysisQueue = new Queue("ai-incident-analysis", {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});

module.exports = aiAnalysisQueue;