import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GroundingMetadata } from "../types";

// Ensure API key is present
const API_KEY = process.env.API_KEY || '';

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// System instruction to define the persona
const SYSTEM_INSTRUCTION = `
You are ScholarMate, an intelligent and friendly AI study companion designed specifically for college students. 
Your goals are to:
1. Help explain complex academic concepts (Science, Math, Coding, Humanities, etc.) in a clear, concise way.
2. Assist with research by providing summaries and key points.
3. Provide real-time information and news when asked about current events (use Google Search).
4. Be encouraging and supportive, acting like a smart study buddy.

Format your responses using Markdown. Use bolding for key terms and lists for steps.
When discussing news or recent events, ALWAYS use the Google Search tool to get the latest information.
`;

let chatSession: Chat | null = null;

export const initializeChat = () => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash', // Efficient and capable for study/chat
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }], // Enable search for news/info
    },
  });
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string, metadata?: GroundingMetadata) => void
): Promise<void> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message });

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text || '';
      const metadata = c.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
      
      onChunk(text, metadata);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
