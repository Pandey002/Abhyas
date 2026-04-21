import Groq from "groq-sdk";
import { ExtractionRequest, Flashcard } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

const SYSTEM_PROMPT = `
You are a "Master Teacher" AI focused on pedagogical depth and active recall.
Your goal is to transform the provided images of study material into high-quality flashcards.
- Avoid passive labels.
- Focus on the "Why", "How", and relationships.
- Use Step-by-step logic for worked examples.
- Call out common pitfalls.

Return ONLY a valid JSON object containing a "cards" array of flashcard objects.
{
  "cards": [
    {
      "front": "Question",
      "back": "Answer",
      "type": "concept | formula | date | process | definition | relationship | edge-case",
      "tags": ["tag1", "tag2"]
    }
  ]
}
`;

export async function generateFlashcards(req: ExtractionRequest, imageUrls: string[] = []): Promise<Partial<Flashcard>[]> {
  const { topic, intent, curriculum } = req;
  
  let curriculumInstruction = "";
  switch (curriculum) {
    case 'JEE Mains':
      curriculumInstruction = "Focus on single-concept MCQ-style questions. Prioritize formulae, units, and definitions.";
      break;
    case 'JEE Advanced':
      curriculumInstruction = "Focus on multi-concept, analytical questions including derivations and conceptual traps.";
      break;
    case 'NEET':
      curriculumInstruction = "Focus on factual recall, terminology, and classifications.";
      break;
    default:
      curriculumInstruction = "Extract comprehensive flashcards covering key concepts and relationships.";
  }

  const basePrompt = intent === 'quick' 
    ? `Create EXACTLY 10 essential flashcards for "${topic}". ${curriculumInstruction} Target EXACTLY 10 cards.`
    : `Create 25-30 comprehensive flashcards for "${topic}". ${curriculumInstruction}`;

  try {
  const MODELS_TO_TRY = [
    "llama-3.2-11b-vision-instant",
    "llama-3.2-90b-vision-instant",
    "llama-3.3-70b-versatile", // Fallback for text-processing if vision fails
    "meta-llama/llama-4-scout-17b-16e-instruct"
  ];

  let lastError: any = null;

  for (const modelId of MODELS_TO_TRY) {
    try {
      console.log(`Groq: Attempting extraction with ${modelId}...`);
      const userContent: any[] = [{ type: "text", text: SYSTEM_PROMPT + "\n\n" + basePrompt }];

      // Add up to 10 images (pages) for analysis
      for (const url of imageUrls.slice(0, 10)) {
        userContent.push({
          type: "image_url",
          image_url: { url }
        });
      }

      const completion = await groq.chat.completions.create({
        model: modelId,
        messages: [
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const responseText = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(responseText);
      console.log(`Groq: Success with ${modelId}!`);
      return parsed.cards || [];
    } catch (e: any) {
      lastError = e;
      const errorMsg = e.message?.toLowerCase() || "";
      const isRetryable = errorMsg.includes("not found") || 
                          errorMsg.includes("does not exist") ||
                          errorMsg.includes("403") ||
                          errorMsg.includes("404") ||
                          errorMsg.includes("503");
      
      if (isRetryable) {
        console.warn(`Groq: ${modelId} failed (${e.message}), trying next...`);
        continue;
      }
      
      throw e;
    }
  }

  throw new Error(`Groq: All vision models failed. Last error: ${lastError?.message || "Unknown error"}`);
}
