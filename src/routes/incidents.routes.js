const express = require("express");
const { createIncident,getIncidents,updateIncident, deleteIncident, analyzeIncidentById } = require("../controllers/incident.controller");
const router = express.Router();

router.post("/",createIncident);
router.get("/",getIncidents);
router.patch("/:id", updateIncident);
router.delete("/:id", deleteIncident);
router.post('/:id/analyze',analyzeIncidentById);
module.exports = router;