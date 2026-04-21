import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ExtractionRequest, Flashcard } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are a "Master Teacher" AI focused on pedagogical depth and active recall.
Your goal is to transform the provided text into high-quality flashcards.
- Avoid passive labels.
- Focus on the "Why", "How", and relationships.
- Use Step-by-step logic for worked examples.
- Call out common pitfalls.

Return ONLY a valid JSON object containing a "cards" array of flashcard objects:
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

// Define schema for structured output to ensure reliability
const FLASHCARD_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    cards: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          front: { type: SchemaType.STRING },
          back: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING },
          tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ["front", "back", "type", "tags"]
      }
    }
  },
  required: ["cards"]
};

export async function generateFlashcards(req: ExtractionRequest, pdfBuffer?: Buffer): Promise<Partial<Flashcard>[]> {
  const { topic, intent, content, curriculum } = req;
  
  let curriculumInstruction = "";
  switch (curriculum) {
    case 'JEE Mains':
      curriculumInstruction = "Focus on single-concept MCQ-style questions. Prioritize formulae, units, definitions, and numerical relationships. Cards should match the difficulty and style of JEE Mains questions — direct, unambiguous, formula-heavy.";
      break;
    case 'JEE Advanced':
      curriculumInstruction = "Focus on multi-concept, analytical questions. Include edge cases, derivations, and conceptual traps. Cards should challenge deeper understanding, not just recall. Match the style of JEE Advanced — complex, multi-step.";
      break;
    case 'NEET':
      curriculumInstruction = "Focus on factual recall, definitions, diagrams, and classifications. Prioritize biology terminology, chemical reactions in biological contexts, and physics applications in medicine. Match NCERT language exactly where possible.";
      break;
    case 'CBSE Class 12':
      curriculumInstruction = "Focus on NCERT-aligned definitions, theorems, and standard questions. Prioritize board exam patterns — 1 mark, 2 mark, and 5 mark question styles. Keep language simple and textbook-accurate.";
      break;
    default:
      curriculumInstruction = "Extract comprehensive, well-structured flashcards covering key concepts, definitions, and relationships in the material.";
  }

  const basePrompt = intent === 'quick' 
    ? `Create EXACTLY 10 essential flashcards for the topic "${topic}". Target Curriculum: ${curriculum}.
       ${curriculumInstruction}
       You MUST generate exactly 10 cards, not more, not less. Focus on the absolute core concepts and definitions. One concept per card.
       Front: Question. Back: Direct, 2-line answer.`
    : `Create 25-30 comprehensive flashcards for the topic "${topic}". Target Curriculum: ${curriculum}.
       ${curriculumInstruction}
       Cover edge cases, specific relationships, and step-by-step logic.
       Include "How does X affect Y?" and "What happens if Z is removed?" type cards.
       Provide 2-3 worked examples.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: FLASHCARD_SCHEMA as any,
      },
    });

    const parts: any[] = [{ text: SYSTEM_PROMPT + "\n\n" + basePrompt }];

    if (pdfBuffer) {
      console.log("AI_SERVICE: Using native PDF analysis...");
      parts.push({
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf"
        }
      });
    } else {
      console.log("AI_SERVICE: Using text-based analysis...");
      parts.push({ text: `Content to analyze: ${content}` });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }]
    });

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    return parsed.cards || [];
  } catch (e: any) {
    console.error("Failed to generate or parse Gemini response:", e);
    throw new Error(e.message || "Failed to generate flashcards from AI service");
  }
}
