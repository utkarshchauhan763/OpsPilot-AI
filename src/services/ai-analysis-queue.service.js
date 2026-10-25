
function createAIAnalysisQueueService(queue) {
  return async function enqueueAIAnalysis(incident) {
    const job = await queue.add("analyze-incident", {
      incidentId: String(incident._id),
      title: incident.title,
      description: incident.description,
      service: incident.service,
      severity: incident.severity,
    });

    return {
      jobId: job.id,
    };
  };
}

module.exports = createAIAnalysisQueueService;
