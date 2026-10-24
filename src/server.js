const app = require("./app");
const PORT = process.env.PORT || 5000;


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