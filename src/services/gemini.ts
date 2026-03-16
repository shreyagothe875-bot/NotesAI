import { GoogleGenerativeAI } from "@google/generative-ai";

// FIX 1 & 2: Use import.meta.env and match the Vercel name exactly
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the AI with the correct Vite environment variable
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
  // Use the standard model name
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Flash is faster for hackathon demos!
  });

  const systemPrompt = `
    Target Role: You are the "Academic Architect," an elite AI specialized in pedagogical science. 
    Transform the input into structured, exam-ready study materials.
    Return the response strictly as a JSON object.
    
    JSON Structure:
    {
      "summary": "markdown string",
      "flashcards": [{"question": "...", "answer": "..."}],
      "quiz": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..."}],
      "quickRecall": ["item 1", "item 2", "item 3", "item 4", "item 5"],
      "criticalThinkingQuestion": "string",
      "pomodoro": {
        "workMinutes": number,
        "breakMinutes": number,
        "difficulty": "Easy" | "Medium" | "Hard",
        "reasoning": "string"
      }
    }
  `;

  const parts: any[] = [{ text: `${systemPrompt}\n\nInput Content: ${text || "Summarize this."}` }];

  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  try {
    // FIX 3: Correct method call for the latest SDK
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const responseText = result.response.text();
    // Clean JSON string in case AI adds markdown blocks
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedJson) as SummaryResult;
  } catch (error) {
    console.error("Error processing lecture:", error);
    throw error;
  }
}