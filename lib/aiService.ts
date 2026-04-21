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
    const userContent: any[] = [{ type: "text", text: SYSTEM_PROMPT + "\n\n" + basePrompt }];

    // Add up to 10 images (pages) for analysis
    for (const url of imageUrls.slice(0, 10)) {
      userContent.push({
        type: "image_url",
        image_url: { url }
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-instant",
      messages: [
        { role: "user", content: userContent }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseText);
    return parsed.cards || [];
  } catch (e: any) {
    console.error("Groq Vision Error:", e);
    throw new Error(e.message || "Failed to generate flashcards from Groq Vision");
  }
}
