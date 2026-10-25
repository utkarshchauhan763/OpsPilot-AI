const Incident = require("../models/incident.model");

function createAIAnalysisQueueService(queue) {
  return async function enqueueAIAnalysis(incident) {
    const job = await queue.add("analyze-incident", {
      incidentId: String(incident._id),
      title: incident.title,
      description: incident.description,
      service: incident.service,
      severity: incident.severity,
    });

      try {
      const updatedIncident = await Incident.findByIdAndUpdate(
        incident._id,
        {
          $set: {
            "aiAnalysis.jobId": String(job.id),
            "aiAnalysis.status": "pending",
            "aiAnalysis.error": null,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedIncident) {
        throw new Error("Incident not found while saving AI job");
      }
    } catch (error) {
      // Prevent a queued job from continuing without its
      // job ID being persisted on the incident.
      try {
        await job.remove();
      } catch (removeError) {
        error.message +=
          "; additionally, unable to remove queued job";
      }

      throw error;
    }


    return {
      jobId: job.id,
    };
  };
}

module.exports = createAIAnalysisQueueService;
