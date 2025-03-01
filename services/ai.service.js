import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are an expert in MERN and Development. You have an experience of 2 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.`
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