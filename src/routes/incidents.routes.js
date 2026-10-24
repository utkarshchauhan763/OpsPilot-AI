const express = require("express");
const { createIncident,getIncidents,updateIncident, deleteIncident } = require("../controllers/incident.controller");
const router = express.Router();

router.post("/",createIncident);
router.get("/",getIncidents);
router.patch("/:id", updateIncident);
router.delete("/:id", deleteIncident);
module.exports = router;