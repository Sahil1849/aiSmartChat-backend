import * as aiService from "../services/ai.service.js";

export const getResults = async (req, res) => {
  try {
    const { prompt } = req.query;
    console.log("Prompt received:", prompt);

    const result = await aiService.resultMessage(prompt);
    console.log("result:", result);
    res.send({ message: result }); 
  } catch (error) {
    console.log("Error in getResults:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};