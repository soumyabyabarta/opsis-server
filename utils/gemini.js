import { GoogleGenerativeAI } from '@google/generative-ai';

const cleanAndParseJSON = (text) => {
  const cleaned = text
    .replace(/^```json\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
  return JSON.parse(cleaned);
};

// 🧠 Bulletproof Multi-LLM Fallback Engine (Using Native Fetch)
const callAIWithFallback = async (prompt) => {
  // gemini
  try {
    console.log("🤖 Trying Gemini API...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log("✅ Success with Gemini!");
    return cleanAndParseJSON(text);
  } catch (geminiError) {
    console.error("❌ Gemini failed:", geminiError.message);
    
    // gemini -> Groq
    try {
      console.log("🚀 Switching to Groq API...");
      if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing in .env");

      const groqRes = await fetch("[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Groq Llama 3
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!groqRes.ok) throw new Error(`Groq HTTP Error: ${groqRes.status}`);
      const groqData = await groqRes.json();
      console.log("✅ Success with Groq!");
      return cleanAndParseJSON(groqData.choices[0].message.content);
    } catch (groqError) {
      console.error("❌ Groq failed:", groqError.message);

      // Groq-> DeepSeek
      try {
        console.log("🧠 Switching to DeepSeek API...");
        if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is missing in .env");

        const deepseekRes = await fetch("[https://api.deepseek.com/chat/completions](https://api.deepseek.com/chat/completions)", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }]
          })
        });

        if (!deepseekRes.ok) throw new Error(`DeepSeek HTTP Error: ${deepseekRes.status}`);
        const deepseekData = await deepseekRes.json();
        console.log("✅ Success with DeepSeek!");
        return cleanAndParseJSON(deepseekData.choices[0].message.content);
      } catch (deepseekError) {
        console.error("❌ DeepSeek failed:", deepseekError.message);
        throw new Error("All AI models are currently overloaded. Please try again in a minute.");
      }
    }
  }
};

/**
 * Analyze a medical report text and return structured AI insights.
 * @param {string} extractedText - The raw text extracted from the medical report
 * @returns {Object} - Structured analysis result
 */
export const analyzeMedicalReport = async (extractedText) => {
  const prompt = `
You are a world-class clinical AI assistant. Analyze the following medical report text and produce a detailed, structured health analysis. 

IMPORTANT: 
- Return ONLY a valid JSON object (no markdown, no code blocks, no extra text).
- Be accurate, compassionate, and use plain English that non-medical users can understand.
- Health score should be between 0-100 based on overall report findings.
- Flag any abnormal values clearly.
- Under NO circumstances should you mention "Gemini", "Google", "OpenAI", "DeepSeek", "Groq", or being a large language model in your response. You must act strictly as the "Opsis AI Clinical Assistant" and refer to yourself as "Opsis AI" if necessary.

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

/**
 * Analyze symptoms described by the user.
 * @param {string} symptomsText - User-described symptoms
 * @returns {Object} - AI analysis of symptoms
 */
export const analyzeSymptoms = async (symptomsText) => {
  const prompt = `
You are a compassionate clinical AI assistant. Analyze the following symptoms and provide helpful, responsible health guidance.

IMPORTANT:
- Return ONLY a valid JSON object (no markdown, no code blocks).
- Be accurate, kind, and use plain English.
- Always remind users to consult a doctor.
- Do NOT diagnose — provide possible conditions and guidance.
- Under NO circumstances should you mention "Gemini", "Google", "OpenAI", "DeepSeek", "Groq", or being a large language model in your response. You must act strictly as the "Opsis AI Clinical Assistant" and refer to yourself as "Opsis AI" if necessary.

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