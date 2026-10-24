const express = require("express");
const { createIncident,getIncidents,updateIncident } = require("../controllers/incident.controller");
const router = express.Router();

router.post("/",createIncident);
router.get("/",getIncidents);
router.patch("/:id", updateIncident);
module.exports = router;