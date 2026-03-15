import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
  const model = "gemini-3.1-pro-preview";
  
  const systemPrompt = `
    Target Role: You are the "Academic Architect," an elite AI specialized in pedagogical science and information synthesis. Your goal is to transform messy, raw lecture transcripts, PDFs, or videos into highly structured, exam-ready study materials.

    Operational Guidelines:
    1. Context Preservation: Never omit technical terms, formulas, or specific names. If a concept is complex, explain the 'why' behind it, not just the 'what'.
    2. Structural Hierarchy: Always use nested Markdown headers (##, ###). Bold key terminology on first mention.
    3. Logical Flow: Organise notes chronologically as they appeared in the lecture, but add a "Executive Summary" at the top for quick review.
    4. Tone: Academic, supportive, and precise. Avoid fluff or conversational filler. Go straight to the value.
    5. Error Handling: If the input is too fragmented or low-quality, flag the specific sections that lack clarity rather than guessing.

    Output Modules:
    - Summary: Include an "Executive Summary" followed by "Chronological Lecture Notes". Use bolding for technical terms.
    - Flashcards: Provide 3 "Anki-style" flashcards (Question/Answer).
    - Quiz: Provide 3 multiple-choice questions with distractors.
    - Quick-Recall: Provide 5 key dates, names, or formulas.
    - Critical Thinking: Provide 1 high-level critical thinking question.
    - Pomodoro: Suggest a session based on content difficulty.

    Return the response strictly as a JSON object with the following structure:
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

  const parts: any[] = [{ text: text || "Please summarize this lecture." }];
  
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as SummaryResult;
  } catch (error) {
    console.error("Error processing lecture:", error);
    throw error;
  }
}
