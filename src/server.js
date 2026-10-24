const express = require("express");
const app = express();
const healthRoutes = require("./routes/health.routes");
const errorHandler = require("./middleware/error.middleware");
app.use(express.json({limit: "10kb"})); // it reduce the risk of clients sending unncessarily large payloads.
const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
    res.status(200).json({
        success: true,
        message: "OpsPilot AI server is running",
    });
});

app.use("/health",healthRoutes);

app.use((req,res)=>{
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});



app.use(errorHandler);

const server = app.listen(PORT,()=>{
    console.log(`OpsPilot AI server is running on port ${PORT}`);
});

function shutdown(signal){
    console.log(`${signal} received. Shutting down server...`);
    server.close(()=>{
        console.log("OpsPilot AI server closed successfully.");
        process.exit(0);
    });
}

process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));