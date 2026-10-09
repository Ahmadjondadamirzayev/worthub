import React, { useState, useEffect } from 'react';
import { X, Volume2, Plus, Check } from 'lucide-react';
import {
  WordItem,
  VocabularyLesson,
  GermanArticle,
  PartOfSpeech,
  CefrLevel,
  UserAccount,
} from '../types/german';
import { ARTICLE_COLORS } from '../utils/germanGrammar';
import { speakGerman } from '../utils/speech';
import { WorthubLogo } from './WorthubLogo';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: VocabularyLesson[];
  defaultLessonId?: string;
  editingWord?: WordItem | null;
  currentUser: UserAccount;
  theme?: 'dark' | 'light';
  onSaveWord: (word: WordItem) => void;
  onOpenImport?: () => void;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  onClose,
  lessons,
  defaultLessonId,
  editingWord,
  currentUser,
  theme = 'dark',
  onSaveWord,
  onOpenImport,
}) => {
  const isDark = theme === 'dark';
  const [setId, setSetId] = useState<string>(defaultLessonId || lessons[0]?.id || '');
  const [german, setGerman] = useState('');
  const [article, setArticle] = useState<GermanArticle>('der');
  const [plural, setPlural] = useState('');
  const [uzbek, setUzbek] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [level, setLevel] = useState<CefrLevel>('A1');
  const [exampleDe, setExampleDe] = useState('');
  const [exampleUz, setExampleUz] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingWord) {
      setSetId(editingWord.setId);
      setGerman(editingWord.german);
      setArticle(editingWord.article);
      setPlural(editingWord.plural || '');
      setUzbek(editingWord.uzbek);
      setPartOfSpeech(editingWord.partOfSpeech);
      setLevel(editingWord.level);
      setExampleDe(editingWord.exampleSentenceDe || '');
      setExampleUz(editingWord.exampleSentenceUz || '');
      setNotes(editingWord.notes || '');
    } else {
      setSetId(defaultLessonId || lessons[0]?.id || '');
      setGerman('');
      setArticle('der');
      setPlural('');
      setUzbek('');
      setPartOfSpeech('noun');
      setLevel('A1');
      setExampleDe('');
      setExampleUz('');
      setNotes('');
    }
    setErrorMsg('');
  }, [editingWord, defaultLessonId, isOpen, lessons]);

  if (!isOpen) return null;

  const umlauts = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

  const handleInsertChar = (char: string) => {
    setGerman((prev) => prev + char);
  };

  const handleTestAudio = () => {
    if (!german.trim()) return;
    const textToSpeak = article !== 'none' ? `${article} ${german}` : german;
    speakGerman(textToSpeak);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!german.trim()) {
      setErrorMsg('Iltimos, nemischa so\'zni kiriting.');
      return;
    }
    if (!uzbek.trim()) {
      setErrorMsg('Iltimos, o\'zbekcha tarjimasini kiriting.');
      return;
    }
    if (!setId) {
      setErrorMsg('Iltimos, darsni (Lektion) tanlang.');
      return;
    }

    const payload: WordItem = {
      id: editingWord ? editingWord.id : `w-${Date.now()}`,
      setId,
      german: german.trim(),
      article: partOfSpeech === 'noun' ? article : 'none',
      plural: plural.trim() || undefined,
      uzbek: uzbek.trim(),
      partOfSpeech,
      level,
      exampleSentenceDe: exampleDe.trim() || undefined,
      exampleSentenceUz: exampleUz.trim() || undefined,
      notes: notes.trim() || undefined,
      isStarred: editingWord ? editingWord.isStarred : false,
      masteryScore: editingWord ? editingWord.masteryScore : 0,
      addedBy: currentUser.id,
      createdAt: editingWord ? editingWord.createdAt : new Date().toISOString().slice(0, 10),
    };

    onSaveWord(payload);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
        isDark ? 'border-slate-800 bg-[#0f172a] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <WorthubLogo size="sm" variant="mark-only" theme={theme} />
            <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {editingWord ? 'Nemischa so\'zni tahrirlash' : 'Yangi nemischa so\'z qo\'shish (Admin)'}
            </h2>
            {!editingWord && onOpenImport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImport();
                }}
                className={`text-xs underline font-medium cursor-pointer ${
                  isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'
                }`}
              >
                Matn faylidan import
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form in Uzbek */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Lesson Selector */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Qaysi darsga (Lektion) tegishli? *
            </label>
            <select
              value={setId}
              onChange={(e) => setSetId(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 transition-colors border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
              required
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.level})
                </option>
              ))}
            </select>
          </div>

          {/* Part of Speech & Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                So'z turkumi
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
                className={`w-full rounded-xl px-3 py-2 transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white'
                }`}
              >
                <option value="noun">Ot (Nomen)</option>
                <option value="verb">Fe'l (Verb)</option>
                <option value="adjective">Sifat (Adjektiv)</option>
                <option value="adverb">Ravish (Adverb)</option>
                <option value="phrase">Ibora / Birikma</option>
                <option value="preposition">Predlog (Präposition)</option>
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Til darajasi (CEFR)
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CefrLevel)}
                className={`w-full rounded-xl px-3 py-2 font-mono transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white'
                }`}
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          {/* German Article (der, die, das) */}
          {partOfSpeech === 'noun' && (
            <div>
              <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Artikl (Genus) *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['der', 'die', 'das', 'none'] as GermanArticle[]).map((art) => {
                  const meta = ARTICLE_COLORS[art];
                  const isSel = article === art;
                  return (
                    <button
                      key={art}
                      type="button"
                      onClick={() => setArticle(art)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        isSel
                          ? `${meta.bg} ${meta.text} ${meta.border} ring-2 ring-amber-500/40`
                          : isDark
                          ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                          : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {art === 'none' ? 'Artiklsiz' : art}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* German Word */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Nemischa so'z *
              </label>
              <button
                type="button"
                onClick={handleTestAudio}
                className="text-amber-500 hover:text-amber-600 flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ovozni tekshirish</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="masalan: Herausforderung"
              value={german}
              onChange={(e) => setGerman(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition-colors border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
              required
            />

            {/* Virtual Umlauts */}
            <div className="flex items-center gap-1.5 pt-1.5">
              <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Umlaute:</span>
              {umlauts.map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleInsertChar(char)}
                  className={`w-6 h-6 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Plural form */}
          {partOfSpeech === 'noun' && (
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Ko'plik shakli (Plural)
              </label>
              <input
                type="text"
                placeholder="masalan: die Herausforderungen"
                value={plural}
                onChange={(e) => setPlural(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 font-mono transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                }`}
              />
            </div>
          )}

          {/* Uzbek Translation */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              O'zbekcha tarjimasi (ma'nosi) *
            </label>
            <input
              type="text"
              placeholder="masalan: qiyinchilik, sinov, vazifa"
              value={uzbek}
              onChange={(e) => setUzbek(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 font-medium transition-colors border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                  : 'bg-slate-50 border-slate-300 text-amber-700 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
              required
            />
          </div>

          {/* German Example Sentence */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Nemischa misol gap (Kontekst)
            </label>
            <input
              type="text"
              placeholder="masalan: Das Projekt ist eine große Herausforderung."
              value={exampleDe}
              onChange={(e) => setExampleDe(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 italic transition-colors border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Uzbek Example Translation */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Misol gapning o'zbekcha tarjimasi
            </label>
            <input
              type="text"
              placeholder="masalan: Ushbu loyiha biz uchun katta sinovdir."
              value={exampleUz}
              onChange={(e) => setExampleUz(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 italic transition-colors border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Notes / Synonyms */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Qo'shimcha izoh, sinonim yoki grammatik qoida
            </label>
            <input
              type="text"
              placeholder="masalan: Sinonim: die Aufgabe / fe'l boshqaruvi: stellen vor"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 transition-colors border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Actions */}
          <div className={`pt-3 border-t flex items-center justify-end gap-2 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-orange-600/20"
            >
              {editingWord ? 'O\'zgarishlarni saqlash' : 'So\'zni bazaga qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
