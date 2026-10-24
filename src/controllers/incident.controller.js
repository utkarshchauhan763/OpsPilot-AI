const Incident = require("../models/incident.model");
const buildIncidentFilter = require("../utils/incident-filter");
const buildPagination = require("../utils/pagination");
async function createIncident(req, res, next) {
    try {
        const {
            title,
            description,
            service,
            severity,
            status,
            source
        } = req.body;

        const incident = new Incident({
            title, description, service, severity, status, source
        });

        await incident.validate();

        await incident.save();

        return res.status(201).json({
            success: true,
            message: "Incident created successfully",
            data: incident,
        });

    }
    catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid incident data",
                errors: Object.values(
                    error.errors || { incident: error }
                ).map((item) => item.message),
            });
        }
        return next(error);
    }
}

async function getIncidents(req, res, next) {
    try {
        const result = buildIncidentFilter(req.query);
        if (result.error) {
            return res.status(400).json({
                success: false,
                message: result.error,
            });
        }
        const pagination = buildPagination(req.query);

        if (pagination.error) {
            return res.status(400).json({
                success: false,
                message: pagination.error,
            });
        }

        const { page, limit, skip } = pagination;


        return res.status(200).json({
            success: true,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            count: incidents.length,
            data: incidents,
        });
    } catch (error) {
        return next(error);
    }
}
module.exports = { createIncident, getIncidents };