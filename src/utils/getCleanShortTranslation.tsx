/**
 * German vocabulary short translation helper.
 * Cleans long descriptions, brackets, synonyms, and extracts a compact translation for cards & games.
 *
 * Examples:
 * "salomlashmoq; hol-ahvol so'ramoq (samimiy)" -> "salomlashmoq"
 * "ishlamoq, mehnat qilmoq (zavodda)" -> "ishlamoq"
 * "kitob / daftar" -> "kitob"
 */
export function getCleanShortTranslation(text?: string | null): string {
  if (!text) return '';
  // 1. Remove parenthesized or bracketed explanations: (samimiy), [formal], etc.
  let clean = text.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();

  // 2. Take first meaning if separated by semicolon
  if (clean.includes(';')) {
    clean = clean.split(';')[0].trim();
  }

  // 3. Take first meaning if separated by slash
  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }

  // 4. If separated by comma with multiple synonyms, pick the primary one
  if (clean.includes(',')) {
    const parts = clean.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      clean = parts[0];
    }
  }

  // 5. Clean extra whitespace
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean || (text ? text.trim() : '');
}

export default getCleanShortTranslation;
