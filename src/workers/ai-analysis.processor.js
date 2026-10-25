
const Incident = require("../models/incident.model");
const { analyzeIncident } = require("../services/ai.service");

async function processAIAnalysisJob(job, analyze = analyzeIncident) {
  const {
    incidentId,
    title,
    description,
    service,
    severity,
  } = job.data;

  console.log(`Processing AI analysis job: ${job.id}`);

  await Incident.findByIdAndUpdate(incidentId, {
    $set: {
      "aiAnalysis.status": "pending",
      "aiAnalysis.error": null,
    },
  });

  try {
    const result = await analyze({
      title,
      description,
      service,
      severity,
    });

    const updatedIncident = await Incident.findByIdAndUpdate(
      incidentId,
      {
        $set: {
          "aiAnalysis.status": "completed",
          "aiAnalysis.model": result.model,
          "aiAnalysis.result": result.analysis,
          "aiAnalysis.error": null,
          "aiAnalysis.completedAt": new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedIncident) {
      throw new Error("Incident not found while saving AI analysis");
    }

    console.log(`AI analysis saved for job: ${job.id}`);

    return {
      incidentId,
      model: result.model,
      analysis: result.analysis,
    };
  } catch (error) {
    if (error.message !== "Incident not found while saving AI analysis") {
      await Incident.findByIdAndUpdate(incidentId, {
        $set: {
          "aiAnalysis.status": "failed",
          "aiAnalysis.error": "AI analysis failed",
        },
      }).catch((saveError) => {
        console.error(
          "Unable to save AI analysis failure status:",
          saveError.message
        );
      });
    }

    throw error;
  }
}

module.exports = processAIAnalysisJob;
