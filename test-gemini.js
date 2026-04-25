import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: './.env' });

async function testGemini() {
  console.log('Testing Gemini API with key from .env...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is not set in .env');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Send a very basic prompt to confirm connection
    const result = await model.generateContent('Say exactly: "API is working"');
    const response = await result.response;
    
    console.log('✅ SUCCESS! Connection established.');
    console.log('🤖 Gemini Response:', response.text().trim());
  } catch (error) {
    console.error('\n❌ API VERIFICATION FAILED');
    console.error('Error Details:', error.message);
  }
}

testGemini();
