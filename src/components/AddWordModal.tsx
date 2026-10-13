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
import { useLanguage } from '../utils/i18n';

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
  const { t, language } = useLanguage();
  const isDark = theme === 'dark';
  const [setId, setSetId] = useState<string>(defaultLessonId || lessons[0]?.id || '');
  const [german, setGerman] = useState('');
  const [article, setArticle] = useState<GermanArticle>('der');
  const [plural, setPlural] = useState('');
  const [uzbek, setUzbek] = useState('');
  const [russian, setRussian] = useState('');
  const [english, setEnglish] = useState('');
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
      setRussian(editingWord.russian || '');
      setEnglish(editingWord.english || '');
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
      setRussian('');
      setEnglish('');
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
      setErrorMsg(
        language === 'ru'
          ? 'Пожалуйста, введите немецкое слово.'
          : language === 'en'
          ? 'Please enter the German word.'
          : 'Iltimos, nemischa so\'zni kiriting.'
      );
      return;
    }
    if (!uzbek.trim()) {
      setErrorMsg(
        language === 'ru'
          ? 'Пожалуйста, введите перевод слова.'
          : language === 'en'
          ? 'Please enter the word translation.'
          : 'Iltimos, o\'zbekcha tarjimasini kiriting.'
      );
      return;
    }
    if (!setId) {
      setErrorMsg(
        language === 'ru'
          ? 'Пожалуйста, выберите урок (Lektion).'
          : language === 'en'
          ? 'Please select a lesson (Lektion).'
          : 'Iltimos, darsni (Lektion) tanlang.'
      );
      return;
    }

    const payload: WordItem = {
      id: editingWord ? editingWord.id : `w-${Date.now()}`,
      setId,
      german: german.trim(),
      article: partOfSpeech === 'noun' ? article : 'none',
      plural: plural.trim() || undefined,
      uzbek: uzbek.trim(),
      russian: russian.trim() || undefined,
      english: english.trim() || undefined,
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
      <div
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          isDark ? 'border-slate-800 bg-[#0f172a] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <WorthubLogo size="sm" variant="mark-only" theme={theme} />
            <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {editingWord
                ? language === 'ru'
                  ? 'Редактировать немецкое слово'
                  : language === 'en'
                  ? 'Edit German Word'
                  : "Nemischa so'zni tahrirlash"
                : language === 'ru'
                ? 'Добавить новое немецкое слово (Админ)'
                : language === 'en'
                ? 'Add New German Word (Admin)'
                : "Yangi nemischa so'z qo'shish (Admin)"}
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
                {language === 'ru'
                  ? 'Импорт из текста / PDF'
                  : language === 'en'
                  ? 'Import from text / PDF'
                  : 'Matn faylidan import'}
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Lesson Selector */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {language === 'ru'
                ? 'К какому уроку (Lektion) относится? *'
                : language === 'en'
                ? 'Which lesson (Lektion) does it belong to? *'
                : 'Qaysi darsga (Lektion) tegishli? *'}
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
                  {language === 'ru'
                    ? `Урок ${l.lektionNumber}: ${l.themeTopic || l.title} (${l.level})`
                    : language === 'en'
                    ? `Lesson ${l.lektionNumber}: ${l.themeTopic || l.title} (${l.level})`
                    : `${l.title} (${l.level})`}
                </option>
              ))}
            </select>
          </div>

          {/* Part of Speech & Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'ru' ? 'Часть речи' : language === 'en' ? 'Part of speech' : "So'z turkumi"}
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
                <option value="noun">
                  {language === 'ru' ? 'Существительное (Nomen)' : language === 'en' ? 'Noun (Nomen)' : 'Ot (Nomen)'}
                </option>
                <option value="verb">
                  {language === 'ru' ? 'Глагол (Verb)' : language === 'en' ? 'Verb (Verb)' : "Fe'l (Verb)"}
                </option>
                <option value="adjective">
                  {language === 'ru' ? 'Прилагательное (Adjektiv)' : language === 'en' ? 'Adjective (Adjektiv)' : 'Sifat (Adjektiv)'}
                </option>
                <option value="adverb">
                  {language === 'ru' ? 'Наречие (Adverb)' : language === 'en' ? 'Adverb (Adverb)' : 'Ravish (Adverb)'}
                </option>
                <option value="phrase">
                  {language === 'ru' ? 'Фраза / Идиома' : language === 'en' ? 'Phrase / Idiom' : 'Ibora / Birikma'}
                </option>
                <option value="preposition">
                  {language === 'ru' ? 'Предлог (Präposition)' : language === 'en' ? 'Preposition (Präposition)' : 'Predlog (Präposition)'}
                </option>
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('level')} (CEFR)
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
                {language === 'ru' ? 'Артикль (Род) *' : language === 'en' ? 'Article (Gender) *' : 'Artikl (Genus) *'}
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
                      {art === 'none'
                        ? language === 'ru'
                          ? 'Без артикля'
                          : language === 'en'
                          ? 'No article'
                          : 'Artiklsiz'
                        : art}
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
                {language === 'ru' ? 'Немецкое слово *' : language === 'en' ? 'German word *' : "Nemischa so'z *"}
              </label>
              <button
                type="button"
                onClick={handleTestAudio}
                className="text-amber-500 hover:text-amber-600 flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{language === 'ru' ? 'Проверить звук' : language === 'en' ? 'Test audio' : 'Ovozni tekshirish'}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder={language === 'ru' ? 'например: Herausforderung' : language === 'en' ? 'e.g. Herausforderung' : 'masalan: Herausforderung'}
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
                {language === 'ru' ? 'Форма мн. числа (Plural)' : language === 'en' ? 'Plural form (Plural)' : "Ko'plik shakli (Plural)"}
              </label>
              <input
                type="text"
                placeholder={language === 'ru' ? 'например: die Herausforderungen' : language === 'en' ? 'e.g. die Herausforderungen' : 'masalan: die Herausforderungen'}
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

          {/* Primary Translation */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {language === 'ru'
                ? 'Перевод (основной) *'
                : language === 'en'
                ? 'Translation (primary) *'
                : "O'zbekcha tarjimasi (ma'nosi) *"}
            </label>
            <input
              type="text"
              placeholder={
                language === 'ru'
                  ? 'например: вызов, сложная задача'
                  : language === 'en'
                  ? 'e.g. challenge, task'
                  : 'masalan: qiyinchilik, sinov, vazifa'
              }
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

          {/* Optional Direct Russian & English inputs for multilingual perfection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'ru' ? '🇷🇺 Русский перевод:' : '🇷🇺 Ruscha tarjimasi (ixtiyoriy):'}
              </label>
              <input
                type="text"
                placeholder={language === 'ru' ? 'например: вызов, испытание' : 'masalan: вызов, испытание'}
                value={russian}
                onChange={(e) => setRussian(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'en' ? '🇬🇧 English translation:' : '🇬🇧 Inglizcha tarjimasi (ixtiyoriy):'}
              </label>
              <input
                type="text"
                placeholder={language === 'en' ? 'e.g. challenge, trial' : 'masalan: challenge, trial'}
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* German Example Sentence */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {language === 'ru' ? 'Пример предложения на немецком:' : language === 'en' ? 'German example sentence:' : "Nemischa misol gap (Kontekst):"}
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

          {/* Example Translation */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {language === 'ru' ? 'Перевод примера предложения:' : language === 'en' ? 'Example sentence translation:' : "Misol gapning tarjimasi:"}
            </label>
            <input
              type="text"
              placeholder={
                language === 'ru'
                  ? 'например: Этот проект — большой вызов для нас.'
                  : language === 'en'
                  ? 'e.g. This project is a great challenge for us.'
                  : 'masalan: Ushbu loyiha biz uchun katta sinovdir.'
              }
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
              {language === 'ru'
                ? 'Примечание, синоним или правило:'
                : language === 'en'
                ? 'Additional note, synonym or rule:'
                : "Qo'shimcha izoh, sinonim yoki grammatik qoida:"}
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
          <div
            className={`pt-3 border-t flex items-center justify-end gap-2 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-orange-600/20"
            >
              {editingWord
                ? t('save')
                : language === 'ru'
                ? 'Добавить слово в базу'
                : language === 'en'
                ? 'Add Word to Database'
                : "So'zni bazaga qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
