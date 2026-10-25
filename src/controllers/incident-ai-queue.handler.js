
function createQueuedAnalysisHandler({
  findIncidentById,
  enqueueAIAnalysis,
}) {
  return async function analyzeIncidentById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid incident ID",
        });
      }

      // Fetch the incident from MongoDB.
      const incident = await findIncidentById(id);

      if (!incident) {
        return res.status(404).json({
          success: false,
          message: "Incident not found",
        });
      }

      // Add the incident to the BullMQ queue.
      const job = await enqueueAIAnalysis(incident);

      return res.status(202).json({
        success: true,
        message: "AI analysis job queued successfully",
        data: {
          incidentId: String(incident._id),
          jobId: job.jobId,
          status: "queued",
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = createQueuedAnalysisHandler;
