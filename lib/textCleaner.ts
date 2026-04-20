/**
 * Text Cleaning Utility for Flashcard Ingestion
 * Focuses on maintaining content integrity while stripping noise.
 */
export function cleanExtractedText(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Remove Page Numbers (e.g., "Page 1 of 10", "1 | 10", "1 / 10" or isolated numbers at end of lines)
  cleaned = cleaned.replace(/Page\s+\d+\s+of\s+\d+/gi, "");
  cleaned = cleaned.replace(/^\s*\d+\s*\|\s*\d+\s*$/gm, "");
  cleaned = cleaned.replace(/^\s*\d+\s*\/\s*\d+\s*$/gm, "");
  cleaned = cleaned.replace(/\s+\d+$/gm, ""); // Remove trailing numbers at end of lines

  // 2. Remove common Header/Footer markers (heuristic-based)
  // Strip lines that start with common header words if they are short (< 40 chars)
  cleaned = cleaned.split('\n').filter(line => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return true;
    
    // Heuristic: If a line is very short and looks like a title/header recurring on every page
    // For now, we skip aggressive filtering to avoid losing content, 
    // but we can add specific patterns if they emerge.
    return true; 
  }).join('\n');

  // 3. Strip irrelevant whitespace but preserve structure
  cleaned = cleaned.replace(/[ \t]+/g, " "); // Collapse multiple spaces/tabs to one
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n"); // Collapse 3+ newlines to 2
  
  // 4. Preserve lists and formulas
  // Formulas often use ^, _, \, (, ) which we didn't touch
  // Lists often start with - or \d. which we didn't touch
  
  return cleaned.trim();
}
