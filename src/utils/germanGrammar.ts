import { GermanArticle, PartOfSpeech, CefrLevel } from '../types/german';

export const ARTICLE_COLORS: Record<
  GermanArticle,
  { text: string; bg: string; border: string; labelUz: string; colorHex: string }
> = {
  der: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    labelUz: 'Maskulin (der) · Erkak jinsi',
    colorHex: '#3b82f6',
  },
  die: {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    labelUz: 'Feminin (die) · Ayol jinsi',
    colorHex: '#f43f5e',
  },
  das: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    labelUz: 'Neutral (das) · O\'rta jins',
    colorHex: '#10b981',
  },
  none: {
    text: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    labelUz: 'Artiklsiz',
    colorHex: '#64748b',
  },
};

export const PART_OF_SPEECH_LABELS_UZ: Record<PartOfSpeech, string> = {
  noun: 'Ot (Nomen)',
  verb: 'Fe\'l (Verb)',
  adjective: 'Sifat (Adjektiv)',
  adverb: 'Ravish (Adverb)',
  phrase: 'Ibora / Birikma',
  preposition: 'Predlog (Präposition)',
};

export const CEFR_COLORS: Record<CefrLevel, string> = {
  A1: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  A2: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  B1: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  B2: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  C1: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  C2: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export const CEFR_DESCRIPTIONS_UZ: Record<CefrLevel, string> = {
  A1: 'A1 · Boshlang\'ich (Grundstufe 1)',
  A2: 'A2 · Boshlang\'ich-davomiy (Grundstufe 2)',
  B1: 'B1 · O\'rta daraja (Mittelstufe 1)',
  B2: 'B2 · Mustaqil daraja (Mittelstufe 2)',
  C1: 'C1 · Yuqori professional (Oberstufe 1)',
  C2: 'C2 · Mukammal daraja (Oberstufe 2)',
};
