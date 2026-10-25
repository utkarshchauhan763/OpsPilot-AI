
const Incident = require("../models/incident.model");

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

      const job = await getJobById(jobId);

      // If Redis no longer has the job, look for its saved
      // analysis in MongoDB.
      if (!job) {
        const incident = await Incident.findOne({
          "aiAnalysis.jobId": jobId,
        })
          .select("aiAnalysis")
          .lean();

        if (!incident) {
          return res.status(404).json({
            success: false,
            message: "AI analysis job not found",
          });
        }

        const analysis = incident.aiAnalysis;

        return res.status(200).json({
          success: true,
          message: "Persisted AI analysis retrieved successfully",
          data: {
            jobId,
            incidentId: String(incident._id),
            status: analysis.status,
            ...(analysis.status === "completed"
              ? {
                  result: {
                    model: analysis.model,
                    analysis: analysis.result,
                    completedAt: analysis.completedAt,
                  },
                }
              : {}),
            ...(analysis.status === "failed"
              ? { analysisError: analysis.error }
              : {}),
          },
        });
      }

      const status = await job.getState();
      const incident = await Incident.findById(job.data.incidentId)
        .select("aiAnalysis")
        .lean();

      const data = {
        jobId: String(job.id),
        incidentId: job.data.incidentId,
        status,
      };

      if (incident?.aiAnalysis) {
        data.analysisStatus = incident.aiAnalysis.status;

        if (incident.aiAnalysis.status === "completed") {
          data.result = {
            model: incident.aiAnalysis.model,
            analysis: incident.aiAnalysis.result,
            completedAt: incident.aiAnalysis.completedAt,
          };
        }

        if (incident.aiAnalysis.status === "failed") {
          data.analysisError = incident.aiAnalysis.error;
        }
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
