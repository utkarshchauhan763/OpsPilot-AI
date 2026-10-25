const express = require("express");
const { createIncident,getIncidents,updateIncident, deleteIncident, analyzeIncidentById, getAIAnalysisJobStatus } = require("../controllers/incident.controller");
const router = express.Router();

router.post("/",createIncident);
router.get("/",getIncidents);
router.patch("/:id", updateIncident);
router.delete("/:id", deleteIncident);
router.post('/:id/analyze',analyzeIncidentById);
router.get("/analysis-jobs/:jobId", getAIAnalysisJobStatus);
module.exports = router;