import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export interface SummaryResult {
  summary: string;
  flashcards: { question: string; answer: string }[];
  quiz: { question: string; options: string[]; correctAnswer: string }[];
  quickRecall: string[];
  criticalThinkingQuestion: string;
  pomodoro: {
    workMinutes: number;
    breakMinutes: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    reasoning: string;
  };
}

export async function processLectureContent(
  text: string,
  fileData?: { data: string; mimeType: string }
): Promise<SummaryResult> {
  // Using 1.5-flash because it's the most stable for JSON output
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const systemPrompt = `
    You are an Academic Architect. Transform input into structured study materials.
    YOU MUST RETURN ONLY A RAW JSON OBJECT. DO NOT INCLUDE MARKDOWN BLOCKS OR TEXT OUTSIDE THE JSON.
    
    Structure:
    {
      "summary": "markdown string",
      "flashcards": [{"question": "string", "answer": "string"}],
      "quiz": [{"question": "string", "options": ["s1", "s2", "s3", "s4"], "correctAnswer": "string"}],
      "quickRecall": ["item1", "item2", "item3", "item4", "item5"],
      "criticalThinkingQuestion": "string",
      "pomodoro": {
        "workMinutes": 25,
        "breakMinutes": 5,
        "difficulty": "Medium",
        "reasoning": "string"
      }
    }
  `;

  const parts: any[] = [{ text: `${systemPrompt}\n\nContent to process: ${text}` }];

  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json", // Forces the model to speak JSON
      }
    });

    const responseText = result.response.text();

    // THE CLEANER: This removes any accidental markdown formatting
    const cleanedJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedJson) as SummaryResult;
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}