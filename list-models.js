import dotenv from 'dotenv';

// .env ফাইল থেকে API Key লোড করা
dotenv.config({ path: './.env' });

async function checkAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ Error: .env ফাইলে GEMINI_API_KEY পাওয়া যায়নি!");
    return;
  }

  console.log("🔍 আপনার API Key এর জন্য সাপোর্টেড মডেলগুলো খোঁজা হচ্ছে...\n");

  try {
    // গুগলের REST API তে রিকোয়েস্ট পাঠানো
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    // শুধু সেই মডেলগুলো ফিল্টার করা যেগুলো টেক্সট জেনারেশন সাপোর্ট করে
    const textModels = data.models.filter(model => 
      model.supportedGenerationMethods.includes("generateContent")
    );

    console.log("✅ আপনি নিচের মডেলগুলো ব্যবহার করতে পারবেন:\n");
    
    textModels.forEach(model => {
      // 'models/' অংশটুকু বাদ দিয়ে শুধু আসল নামটা প্রিন্ট করা
      const cleanName = model.name.replace('models/', '');
      console.log(`👉 মডেলের নাম: ${cleanName}`);
      console.log(`   কাজ: ${model.description}`);
      console.log("--------------------------------------------------");
    });

  } catch (error) {
    console.error("❌ নেটওয়ার্ক বা অন্য কোনো সমস্যা হয়েছে:", error.message);
  }
}

checkAvailableModels();