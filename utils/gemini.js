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

    // 🚨 HACK: Breaking the string so copy-paste doesn't add markdown brackets!
    const groqURL = "https://" + "[api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)";

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
    throw new Error("Opsis AI is currently overloaded. Please try again in a minute.");
  }
};

export const analyzeMedicalReport = async (extractedText) => {
  const prompt = `
You are a world-class clinical AI assistant. Analyze the following medical report text and produce a detailed, structured health analysis. 

IMPORTANT: 
- Return ONLY a valid JSON object (no markdown, no code blocks, no extra text).
- Be accurate, compassionate, and use plain English that non-medical users can understand.
- Health score should be between 0-100 based on overall report findings.
- Flag any abnormal values clearly.

Medical Report:
"""
${extractedText}
"""

Return this exact JSON structure:
{
  "healthScore": <number 0-100>,
  "scoreLabel": "<Excellent|Good|Fair|Poor|Critical>",
  "scoreDescription": "<1-2 sentence description of what the score means>",
  "summary": "<3-5 sentence plain English summary of the report, what's normal and what needs attention>",
  "confidence": <number 0-100 representing AI confidence>,
  "flaggedValues": [
    {
      "name": "<biomarker name>",
      "value": "<measured value with unit>",
      "normalRange": "<normal range>",
      "status": "<Low|High|Borderline|Critical>",
      "description": "<1 sentence plain English explanation>"
    }
  ],
  "normalValues": [
    {
      "name": "<biomarker name>",
      "value": "<measured value with unit>"
    }
  ],
  "medicines": [
    {
      "name": "<medicine or supplement name>",
      "purpose": "<why it's recommended>",
      "dosage": "<suggested dosage if determinable>",
      "icon": "<emoji>"
    }
  ],
  "recommendations": [
    {
      "text": "<actionable recommendation>",
      "priority": "<High|Medium|Low>",
      "icon": "<emoji>"
    }
  ],
  "followUp": "<Follow-up recommendation, e.g. when to retest>",
  "disclaimers": "This analysis is AI-generated for informational purposes only. Always consult a qualified healthcare professional before making any medical decisions."
}
`;

  return await callAIWithFallback(prompt);
};

export const analyzeSymptoms = async (symptomsText) => {
  const prompt = `
You are a compassionate clinical AI assistant. Analyze the following symptoms and provide helpful, responsible health guidance.

IMPORTANT:
- Return ONLY a valid JSON object (no markdown, no code blocks).
- Be accurate, kind, and use plain English.
- Always remind users to consult a doctor.
- Do NOT diagnose — provide possible conditions and guidance.

Symptoms:
"""
${symptomsText}
"""

Return this exact JSON structure:
{
  "urgencyLevel": "<Emergency|Urgent|Moderate|Low>",
  "urgencyColor": "<red|orange|yellow|green>",
  "possibleConditions": [
    {
      "name": "<condition name>",
      "probability": "<High|Moderate|Low>",
      "description": "<brief description>"
    }
  ],
  "immediateActions": ["<action 1>", "<action 2>"],
  "selfCareAdvice": ["<advice 1>", "<advice 2>"],
  "warningSignsToWatchFor": ["<warning 1>", "<warning 2>"],
  "whenToSeeDoctor": "<specific guidance on when to seek medical care>",
  "summary": "<2-3 sentence compassionate summary>",
  "disclaimers": "This is not a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation."
}
`;

  return await callAIWithFallback(prompt);
};