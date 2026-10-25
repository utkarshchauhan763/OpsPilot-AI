function createAnalyzeIncidentHandler({
    findIncidentById,
    analyzeIncident,
}){
    return async function analyzeIncidentById(req,res,next){
        try{
            const { id } = req.params;
            if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({
            success: false,
            message: "Invalid incident ID",
            });
          }

          const incident = await findIncidentById(id);
          if(!incident){
            return res.status(404).json({
                success: false,
                message: "Incident not found",
            });
          }

          const result = await analyzeIncident({
            title: incident.title,
            description: incident.description,
            service: incident.service,
            severity: incident.severity,
          });

          return res.status(200).json({
            success: true,
            message: "Incident analyzed successfully",
            data: {
                incidentId: incident._id,
                model: result.model,
                analysis: result.analysis,
            },
          });
        } catch(error){
            return next(error);
        }
    };
}

module.exports = createAnalyzeIncidentHandler;