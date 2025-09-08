import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Creating Notes from Prompt => /api/v1/notes
export const createNotes = catchAsyncErrors(async (req, res, next) => {
  const { messages } = req.body; 
  // 👆 Now expect an array like: 
  // [ { role: "user", content: "Hello" }, { role: "bot", content: "Hi Vinil" } ]

  if (!messages || !Array.isArray(messages)) {
    return next(new ErrorHandler("Please send messages array", 400));
  }

  // Convert into Gemini-friendly "contents" format
  const contents = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents,
  });

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    return res.status(200).json({
      success: true,
      result: response,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    const notes = response.candidates[0].content.parts[0].text;
    return res.status(200).json({
      success: true,
      result: notes,
    });
  }
});