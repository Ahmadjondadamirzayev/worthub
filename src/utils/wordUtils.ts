/**
 * Utilities for German vocabulary formatting and cleaning
 */

/**
 * Strips leading German article ("der", "die", "das") if present
 */
export function getBareGerman(german: string): string {
  if (!german) return '';
  return german.replace(/^(der|die|das)\s+/i, '').trim();
}

/**
 * Extracts a concise, commonly used short translation for games and quizzes
 * Strips long explanatory text in parentheses, extra clauses, and multi-line descriptions.
 * Example:
 * "salomlashmoq; hol-ahvol so'ramoq (samimiy)" -> "salomlashmoq"
 * "ishlamoq, mehnat qilmoq (zavodda)" -> "ishlamoq"
 */
export function getCleanShortTranslation(text: string): string {
  if (!text) return '';
  // 1. Remove text inside parentheses (e.g., "(samimiy)", "(o'qish uchun asar)")
  let clean = text.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();

  // 2. Take first part if separated by semicolon
  if (clean.includes(';')) {
    clean = clean.split(';')[0].trim();
  }

  // 3. Take first part if separated by slash
  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }

  // 4. If there's a comma list of many synonyms, take the first primary meaning
  if (clean.includes(',')) {
    const parts = clean.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      clean = parts[0];
    }
  }

  // 5. Clean extra spaces
  clean = clean.replace(/\s+/g, ' ').trim();

  // If cleaning resulted in empty string, fallback to original trimmed
  return clean || text.trim();
}
