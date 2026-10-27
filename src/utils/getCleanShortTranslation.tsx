/**
 * German vocabulary short translation helper.
 * Cleans long descriptions, brackets, synonyms, and extracts a compact translation for cards & games.
 *
 * Misollar:
 * "salomlashmoq; hol-ahvol so'ramoq (samimiy)" -> "salomlashmoq"
 * "ishlamoq, mehnat qilmoq (zavodda)" -> "ishlamoq"
 * "kitob / daftar" -> "kitob"
 */
export function getCleanShortTranslation(text?: string | null): string {
  if (!text) return '';
  // 1. Qavs ichidagi tushuntirishlarni tozalash: (samimiy), [formal], va h.k.
  let clean = text.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();

  // 2. Nuqta-vergul (;) bo'lsa faqat birinchi asosiy tarjimani olish
  if (clean.includes(';')) {
    clean = clean.split(';')[0].trim();
  }

  // 3. Qiya chiziq (/) bo'lsa faqat birinchi qismini olish
  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }

  // 4. Ko'p sinonimlar vergul bilan kelgan bo'lsa, birinchi asosiy ma'noni olish
  if (clean.includes(',')) {
    const parts = clean.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      clean = parts[0];
    }
  }

  // 5. Ortiqcha probellarni tozalash
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean || (text ? text.trim() : '');
}

export default getCleanShortTranslation;
