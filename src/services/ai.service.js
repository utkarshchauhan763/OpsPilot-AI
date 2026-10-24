const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

async function analyzeIncident({ title, description, service, severity }){
    if(!title || !description || !service || !severity){
        throw new Error("Incident details are required for AI analysis");
    }
    const prompt = `You are a DevOps incident analysis assistant.

Analyze the incident below and return:
1. Likely cause
2. Recommended troubleshooting steps
3. Potential impact

Clearly state uncertainty. Do not claim that you inspected logs or systems.

Incident:
Title: ${title}
Description: ${description}
Service: ${service}
Severity: ${severity}
`;

let response;
try{
    response = await fetch(`${OLLAMA_URL}/api/generate`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",

        },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false,

        }),
        signal: AbortSignal.timeout(60000),
    });
} catch(error){
    if(error.name === "TimeoutError" || error.name === "AbortError"){
        throw new Error("Ai analysis timed out");
    }

    throw new Error("Unable to connect to Ollama");
}

if(!response.ok){
    throw new Error(`Ollama request failed with status ${response.status}`);
}

const data = await response.json();
if (!data.response || typeof data.response !== "string") {
    throw new Error("Ollama returned an invalid analysis response");
  }

  return {
    model: OLLAMA_MODEL,
    analysis: data.response.trim(),
  };


}


module.exports = { analyzeIncident };