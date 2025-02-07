import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a highly skilled software engineer..." 
});

export const resultMessage = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response?.text?.();
    return responseText || "No response received.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "An error occurred while generating the response.";
  }
};