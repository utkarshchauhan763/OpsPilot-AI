
function createAIAnalysisStatusHandler({ getJobById }) {
  return async function getAIAnalysisStatus(req, res, next) {
    try {
      const { jobId } = req.params;

      if (
        !jobId ||
        typeof jobId !== "string" ||
        jobId.length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid job ID",
        });
      }

      // Retrieve the job from BullMQ.
      const job = await getJobById(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "AI analysis job not found",
        });
      }

      const status = await job.getState();

      const data = {
        jobId: String(job.id),
        incidentId: job.data.incidentId,
        status,
      };

      if (status === "completed") {
        data.result = job.returnvalue;
      }

      if (status === "failed") {
        data.message = "AI analysis failed";
        data.reason = job.failedReason;
      }

      return res.status(200).json({
        success: true,
        message: "AI analysis job status retrieved successfully",
        data,
      });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = createAIAnalysisStatusHandler;
