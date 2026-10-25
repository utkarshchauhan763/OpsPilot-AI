const { analyzeIncident } = require("../services/ai.service");
async function processAIAnalysisJob(job,analyze = analyzeIncident){
    const {incidentId, title, description, service, severity } = job.data;
    console.log(`Processing AI analysis job: ${job.id}`);

    const result = await analyze({
        title,description,service,severity,
    });

    console.log(`Ai analysis completed for job: ${job.id}`);

    return {
        incidentId,
        model: result.model,
        analysis: result.analysis
    };
}

module.exports = processAIAnalysisJob;