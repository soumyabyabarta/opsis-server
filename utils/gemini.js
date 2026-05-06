const cleanAndParseJSON = (text) => {
  const cleaned = text
    .replace(/^```json\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
  return JSON.parse(cleaned);
};

// 🚀 Bulletproof AI Engine (Powered by Groq)
const callAIWithFallback = async (prompt) => {
  try {
    console.log("🚀 Calling Groq API...");
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing in .env");

    // ✅ THE REAL HACK: No brackets, no markdown detection.
    const part1 = "api.groq.com";
    const part2 = "/openai/v1/chat/completions";
    const groqURL = `https://${part1}${part2}`;

    const groqRes = await fetch(groqURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq HTTP Error: ${groqRes.status} - ${errText}`);
    }
    
    const groqData = await groqRes.json();
    console.log("✅ Success with Groq!");
    return cleanAndParseJSON(groqData.choices[0].message.content);
    
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    
    throw new Error(error.message || "Opsis AI is currently overloaded.");
  }
};

export const analyzeMedicalReport = async (extractedText) => {
  const prompt = `
You are a world-class clinical AI assistant. Analyze the following medical report text and produce a detailed, structured health analysis. 

IMPORTANT: 
- Return ONLY a valid JSON object.
- Be accurate, compassionate, and use plain English.
- Health score should be between 0-100.

Medical Report:
"""
${extractedText}
"""

Return this exact JSON structure:
{
  "healthScore": 0,
  "scoreLabel": "",
  "scoreDescription": "",
  "summary": "",
  "confidence": 0,
  "flaggedValues": [
    { "name": "", "value": "", "normalRange": "", "status": "", "description": "" }
  ],
  "normalValues": [
    { "name": "", "value": "" }
  ],
  "medicines": [
    { "name": "", "purpose": "", "dosage": "", "icon": "" }
  ],
  "recommendations": [
    { "text": "", "priority": "", "icon": "" }
  ],
  "followUp": "",
  "disclaimers": "This analysis is AI-generated for informational purposes only."
}
`;

  return await callAIWithFallback(prompt);
};

export const analyzeSymptoms = async (symptomsText) => {
  const prompt = `
You are a compassionate clinical AI assistant. Analyze the following symptoms and provide helpful, responsible health guidance.

IMPORTANT:
- Return ONLY a valid JSON object.
- Do NOT diagnose — provide possible conditions and guidance.

Symptoms:
"""
${symptomsText}
"""

Return this exact JSON structure:
{
  "urgencyLevel": "",
  "urgencyColor": "",
  "possibleConditions": [
    { "name": "", "probability": "", "description": "" }
  ],
  "immediateActions": [],
  "selfCareAdvice": [],
  "warningSignsToWatchFor": [],
  "whenToSeeDoctor": "",
  "summary": "",
  "disclaimers": "This is not a medical diagnosis."
}
`;

  return await callAIWithFallback(prompt);
};