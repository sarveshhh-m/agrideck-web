import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

export const geminiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function isConfigured(): boolean {
  return geminiClient !== null;
}
