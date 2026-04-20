import Groq from "groq-sdk";
import { ExtractionRequest, Flashcard } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

export async function generateFlashcards(req: ExtractionRequest): Promise<Partial<Flashcard>[]> {
  const { topic, intent, content } = req;
  
  const userPrompt = intent === 'quick' 
    ? `Create 15-20 essential flashcards for the topic "${topic}". 
       Focus on the absolute core concepts and definitions. One concept per card.
       Front: Question. Back: Direct, 2-line answer.
       Content: ${content}`
    : `Create 40-60 comprehensive flashcards for the topic "${topic}".
       Cover edge cases, specific relationships, and step-by-step logic.
       Include "How does X affect Y?" and "What happens if Z is removed?" type cards.
       Provide 2-3 worked examples.
       Content: ${content}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ],
    model: "llama-3.1-8b-instant", // Updated from decommissioned llama3-8b-8192
    response_format: { type: "json_object" }
  });

  const responseText = chatCompletion.choices[0]?.message?.content || "[]";
  try {
    // Groq JSON mode might return { "cards": [...] } or just the array if handled correctly
    const parsed = JSON.parse(responseText);
    return Array.isArray(parsed) ? parsed : (parsed.cards || []);
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return [];
  }
}
