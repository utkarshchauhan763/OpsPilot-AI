const express = require("express");
const healthRoutes = require("./routes/health.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(express.json({limit: "10kb"}));

app.get("/", (req,res) => {
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

module.exports = app;