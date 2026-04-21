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

Return ONLY a valid JSON object containing a "cards" array.
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
    ? `Create EXACTLY 10 essential, high-impact flashcards for "${topic}". ${curriculumInstruction} Target EXACTLY 10 cards.`
    : `Create an ULTRA-EXTENSIVE deck for "${topic}". ${curriculumInstruction} 
       CRITICAL COMMAND: You MUST generate AT LEAST 25-35 unique flashcards by breaking down every single paragraph, definition, formula, and example. 
       Do not group concepts together—atomize everything into separate, highly specific cards. 
       If you output fewer than 25 cards, you fail the extraction.`;

  let lastError: any = null;
  let availableModels: string[] = [];

  try {
    // 1. DYNAMIC DISCOVERY: Get the actual list of models from Groq
    const modelList = await groq.models.list();
    availableModels = modelList.data.map(m => m.id);
    
    // 2. Filter for Vision models or likely candidates
    const visionModels = availableModels.filter(id => 
      id.toLowerCase().includes("vision") || 
      id.toLowerCase().includes("scout") ||
      id.toLowerCase().includes("pixtral")
    );

    // If no vision specific models found, try the ones we know
    const MODELS_TO_TRY = visionModels.length > 0 
      ? visionModels 
      : ["llama-3.2-11b-vision-instant", "meta-llama/Llama-3.2-11B-Vision-Instant"];

    for (const modelId of MODELS_TO_TRY) {
      try {
        console.log(`Groq Vision: Processing with ${modelId}...`);
        
        const userContent: any[] = [{ type: "text", text: SYSTEM_PROMPT + "\n\n" + basePrompt }];
        // Llama 4 Scout and others have a 5-image limit
        for (const url of imageUrls.slice(0, 5)) {
          userContent.push({ type: "image_url", image_url: { url } });
        }

        const completion = await groq.chat.completions.create({
          model: modelId,
          messages: [{ role: "user", content: userContent }],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 4000,
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(responseText);
        return parsed.cards || [];
      } catch (e: any) {
        lastError = e;
        console.warn(`Groq: ${modelId} failed: ${e.message}`);
        continue;
      }
    }
  } catch (discoveryErr: any) {
    console.error("Groq Discovery Error:", discoveryErr);
    lastError = discoveryErr;
  }

  throw new Error(`Groq Discovery failed. Your key can see these models: [${availableModels.join(", ")}]. Last error: ${lastError?.message}`);
}
