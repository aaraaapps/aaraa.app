
import { GoogleGenAI } from "@google/genai";
import { Employee, UserRole } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDashboardInsights(user: Employee, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Role: ${user.role}
Designation: ${user.designation}
Department: ${user.department}
Dashboard Context: ${context}

You are the AARAA Infrastructure AI Assistant. Provide a short, executive insight based on this role and context. 
Be concise, professional, and Apple-style minimalistic. 
Highlight any potential anomalies or key areas of focus. 
Do not apologize. 
Maximum 3 sentences.`,
    });

    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Ready to assist you with your daily operations.";
  }
}

export async function chatWithAssistant(user: Employee, message: string, history: any[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are the AARAA Infrastructure Enterprise AI. 
      The current user is ${user.name} (${user.designation}) in the ${user.department} department. 
      Their role is ${user.role}.
      Provide professional decision support. 
      Reference the company branding (excellence, infrastructure, premium).
      Keep answers short and actionable.`
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
