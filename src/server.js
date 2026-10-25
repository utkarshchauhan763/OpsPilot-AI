const app = require("./app");
const connectDB = require("./config/database");
const PORT = process.env.PORT || 5000;

let server; 

async function startServer(){
    try{
        await connectDB();

        server = app.listen(PORT, ()=>{
            console.log(`OpsPilot AI server is running on port ${PORT}`);
        });

    }catch(error){
        console.error("Failed to start OpsPilot AI:", error.message);
        process.exitCode = 1;
    }
}

function shutdown(signal){
    console.log(`${signal} received. Shutting down server...`);
    server.close(async ()=>{
        await mongoose.disconnect();
        console.log("OpsPilot AI server closed successfully.");
        process.exit(0);
    });
}

process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));

startServer();