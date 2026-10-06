export type GermanArticle = 'der' | 'die' | 'das' | 'none';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrase'
  | 'preposition';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface WordItem {
  id: string;
  setId: string; // Belongs to a lesson (Lektion)
  german: string;
  article: GermanArticle;
  plural?: string;
  uzbek: string; // O'zbekcha tarjimasi
  partOfSpeech: PartOfSpeech;
  level: CefrLevel;
  exampleSentenceDe?: string;
  exampleSentenceUz?: string;
  notes?: string;
  tip?: string; // 💡 Maslahat yoki qoida
  weekday?: string; // e.g. Dushanba, Seshanba
  isActive?: boolean; // ✓ Faol
  isStarred?: boolean;
  masteryScore?: number;
  addedBy: string;
  createdAt: string;
}

export interface VocabularyLesson {
  id: string;
  lektionNumber: number;
  title: string;
  themeTopic?: string; // Foydalanuvchi qo'shgan mavzu nomi
  germanTitle?: string;
  description?: string;
  level: CefrLevel;
  color?: string;
  isActive?: boolean; // ✓ Galochka: To'plam Faol
  createdAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  phone?: string;
  role: 'admin' | 'student';
  assignedLevel: CefrLevel;
  isActive: boolean;
  xp?: number;
  streakDays?: number;
  wordsCount?: number;
  createdAt: string;
  lastActive: string;
  notes?: string;
}

export interface UserSessionLog {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'student';
  loginTime: string;
  ipOrDevice: string;
}

export interface StudentApplication {
  id: string;
  name: string;
  phone: string;
  level: CefrLevel;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export type StudyMode =
  | 'overview'
  | 'flashcards'
  | 'learn'
  | 'match'
  | 'spell'
  | 'articles';

export type GameModuleId =
  | 'super-yodlash'
  | 'artikel-meister'
  | 'wort-paare'
  | 'blitz-wort'
  | 'buchstabensalat'
  | 'wort-quiz'
  | 'horverstehen'
  | 'kasus-trainer'
  | 'verb-konjugation'
  | 'satzbau-profi'
  | 'plural-trainer'
  | 'perfekt-trainer'
  | 'praepositionen'
  | 'modalverben'
  | 'adjektiv-deklination'
  | 'super-yodlash-reaktiv'
  | 'lektion-words-quiz';
