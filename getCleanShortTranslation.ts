// Qavslar, uzun tushuntirishlar va ko'p variantlarni tozalab, eng ixcham asosiy ma'nosini olish
export const getCleanShortTranslation = (text: string): string => {
  if (!text) return '';
  // Qavslar ichidagi uzun izohlarni olib tashlash: "(masalan, kitob)" -> ""
  let clean = text.replace(/\([^)]*\)/g, '').trim();
  // Vergul yoki nuqtali vergul bilan ajratilgan bo'lsa, eng birinchi asosiy variantini olish
  if (clean.includes(',')) {
    const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 0 && parts[0].length >= 2) {
      clean = parts[0];
    }
  } else if (clean.includes(';')) {
    const parts = clean.split(';').map(p => p.trim()).filter(Boolean);
    if (parts.length > 0 && parts[0].length >= 2) {
      clean = parts[0];
    }
  }
  // Agar juda uzun bo'lsa qisqartirish
  if (clean.length > 35) {
    clean = clean.substring(0, 32) + '...';
  }
  return clean || text;
};
