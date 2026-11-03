import React, { useState, useEffect } from 'react';
import {
  Folder,
  Search,
  CheckCircle2,
  FileText,
  Plus,
  ChevronUp,
  ChevronDown,
  Volume2,
  Trash2,
  Edit2,
  Sparkles,
  Check,
  Layers,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Copy,
  Flame,
  Star,
  CheckCheck,
} from 'lucide-react';
import {
  VocabularyLesson,
  WordItem,
  UserAccount,
  CefrLevel,
} from '../types/german';
import { speakGerman } from '../utils/speech';
import { useLanguage } from '../utils/i18n';
import {
  getWordTranslation,
  getLessonDisplayTitle,
  getLessonDisplayTheme,
} from '../utils/wordTranslationHelper';
import { getBareGerman, getFullGermanWord } from '../utils/germanGrammar';

interface LektionenViewProps {
  lessons: VocabularyLesson[];
  words: WordItem[];
  currentUser: UserAccount;
  theme?: 'dark' | 'light';
  onUpdateLesson: (id: string, updates: Partial<VocabularyLesson>) => void;
  onCreateLesson: (title: string, themeTopic: string, level: CefrLevel) => void;
  onDeleteLesson: (id: string) => void;
  onSaveWord: (word: WordItem) => void;
  onDeleteWord: (id: string) => void;
  onToggleWordActive: (id: string) => void;
  onOpenAddWord: (defaultLessonId: string) => void;
  onOpenImport: (defaultLessonId: string) => void;
  onAwardXp?: (amount: number, reason: string) => void;
}

const STORAGE_KEY_MASTERED_WORDS = 'worthub_mastered_words_v2';

export const LektionenView: React.FC<LektionenViewProps> = ({
  lessons,
  words,
  currentUser,
  theme = 'dark',
  onUpdateLesson,
  onCreateLesson,
  onDeleteLesson,
  onSaveWord,
  onDeleteWord,
  onToggleWordActive,
  onOpenAddWord,
  onOpenImport,
  onAwardXp,
}) => {
  const { t, language } = useLanguage();
  const [activeLessonId, setActiveLessonId] = useState<string>(
    lessons[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [articleFilter, setArticleFilter] = useState<'all' | 'der' | 'die' | 'das' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'flashcards'>('grid');
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedWordId, setCopiedWordId] = useState<string | null>(null);

  // Mastered words tracked locally to build daily habit
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MASTERED_WORDS);
      if (stored) return new Set(JSON.parse(stored));
    } catch (e) {}
    return new Set<string>();
  });

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [shuffledDeck, setShuffledDeck] = useState<WordItem[]>([]);

  // Modals state
  const [editingThemeLessonId, setEditingThemeLessonId] = useState<string | null>(null);
  const [themeInput, setThemeInput] = useState('');
  const [isCreatingLektion, setIsCreatingLektion] = useState(false);
  const [newLektionTitle, setNewLektionTitle] = useState('');
  const [newLektionTheme, setNewLektionTheme] = useState('');
  const [newLektionLevel, setNewLektionLevel] = useState<CefrLevel>('A1');

  // Deletion modals
  const [wordToDelete, setWordToDelete] = useState<WordItem | null>(null);
  const [isClearingAllWords, setIsClearingAllWords] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<VocabularyLesson | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const isDark = theme === 'dark';

  const currentLesson =
    lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const currentLessonWords = words.filter((w) => w.setId === currentLesson?.id);

  // Sync shuffled deck when active lesson or words change
  useEffect(() => {
    setShuffledDeck(currentLessonWords);
    setCardIndex(0);
    setIsCardFlipped(false);
  }, [activeLessonId, words]);

  // Mastered count in this lesson
  const lessonMasteredCount = currentLessonWords.filter((w) => masteredIds.has(w.id)).length;
  const lessonMasteryPercent = currentLessonWords.length > 0
    ? Math.round((lessonMasteredCount / currentLessonWords.length) * 100)
    : 0;

  // Toggle word mastery
  const handleToggleMastered = (wordId: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      const isAlready = next.has(wordId);
      if (isAlready) {
        next.delete(wordId);
      } else {
        next.add(wordId);
        if (onAwardXp) {
          onAwardXp(3, "So'z yodlandi");
        }
      }
      try {
        localStorage.setItem(STORAGE_KEY_MASTERED_WORDS, JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  // Copy word
  const handleCopyWord = (word: WordItem) => {
    const text = `${getFullGermanWord(word.german, word.article)} - ${getWordTranslation(word, language)}`;
    navigator.clipboard.writeText(text);
    setCopiedWordId(word.id);
    setTimeout(() => setCopiedWordId(null), 1500);
  };

  // Filtering
  const filteredWords = currentLessonWords.filter((w) => {
    // Article filter
    if (articleFilter === 'der' && w.article !== 'der') return false;
    if (articleFilter === 'die' && w.article !== 'die') return false;
    if (articleFilter === 'das' && w.article !== 'das') return false;
    if (articleFilter === 'other' && (w.article === 'der' || w.article === 'die' || w.article === 'das')) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.german.toLowerCase().includes(q) ||
      w.uzbek.toLowerCase().includes(q) ||
      w.tip?.toLowerCase().includes(q) ||
      w.plural?.toLowerCase().includes(q)
    );
  });

  const activeWordsCount = currentLessonWords.filter((w) => w.isActive !== false).length;

  const handleToggleLessonActive = (lesson: VocabularyLesson) => {
    onUpdateLesson(lesson.id, { isActive: !lesson.isActive });
  };

  const startEditTheme = (lesson: VocabularyLesson) => {
    setEditingThemeLessonId(lesson.id);
    setThemeInput(lesson.themeTopic || lesson.title || '');
  };

  const saveTheme = (lessonId: string) => {
    if (themeInput.trim()) {
      onUpdateLesson(lessonId, {
        themeTopic: themeInput.trim(),
        title: `Lektion ${lessons.find((l) => l.id === lessonId)?.lektionNumber || 1}: ${themeInput.trim()}`,
      });
    }
    setEditingThemeLessonId(null);
  };

  const handleCreateLektionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNum = lessons.length + 1;
    const title = newLektionTitle.trim() || `Lektion ${nextNum} To'plami`;
    const themeName = newLektionTheme.trim() || 'Yangi mavzu';
    onCreateLesson(title, themeName, newLektionLevel);
    setIsCreatingLektion(false);
    setNewLektionTitle('');
    setNewLektionTheme('');
  };

  const currentFlashcard = shuffledDeck[cardIndex] || currentLessonWords[0];

  const handleNextCard = () => {
    setIsCardFlipped(false);
    if (cardIndex + 1 < shuffledDeck.length) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCardIndex(0);
    }
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    if (cardIndex > 0) {
      setCardIndex((prev) => prev - 1);
    } else {
      setCardIndex(shuffledDeck.length - 1);
    }
  };

  const handleShuffleDeck = () => {
    const shuffled = [...currentLessonWords].sort(() => Math.random() - 0.5);
    setShuffledDeck(shuffled);
    setCardIndex(0);
    setIsCardFlipped(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-bar: Collection Title / Stats & Search */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#0f1422] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-2 text-white">
              <span>{t('lek_collection_mode')}</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-amber-400">{words.length} ta so'z</span>
              <span className="text-slate-500">·</span>
              <span className="font-mono text-emerald-400">{masteredIds.size} ta yodlandi</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentLesson ? getLessonDisplayTitle(currentLesson, language) : ''}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('lek_search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium border ${
              isDark
                ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>
      </div>

      {/* Lektion Tabs Switcher (Scrollable horizontally) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {lessons.map((lesson) => {
          const isSelected = lesson.id === activeLessonId;
          const wordCount = words.filter((w) => w.setId === lesson.id).length;
          const tabLabel =
            language === 'ru'
              ? `Урок ${lesson.lektionNumber}`
              : language === 'en'
              ? `Lesson ${lesson.lektionNumber}`
              : `Lektion ${lesson.lektionNumber}`;

          return (
            <button
              key={lesson.id}
              onClick={() => {
                setActiveLessonId(lesson.id);
                setCardIndex(0);
                setIsCardFlipped(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white border-amber-400 shadow-md shadow-orange-500/20'
                  : isDark
                  ? 'bg-[#111726] border-white/[0.06] text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              <span>{tabLabel}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected
                    ? 'bg-black/30 text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {wordCount}
              </span>
            </button>
          );
        })}

        {isAdmin && (
          <button
            onClick={() => setIsCreatingLektion(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Yangi</span>
          </button>
        )}
      </div>

      {/* Main Lektion Container */}
      {currentLesson && (
        <div
          className={`rounded-3xl border p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden transition-all ${
            isDark
              ? 'bg-gradient-to-b from-[#111726] to-[#0a0d16] border-white/[0.08]'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Header of Lektion */}
          <div
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
              isDark ? 'border-white/[0.08]' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* German flag */}
              <div className="w-6 h-4 rounded-xs overflow-hidden flex flex-col border border-white/20 shadow-sm shrink-0">
                <div className="h-1/3 bg-black" />
                <div className="h-1/3 bg-[#de0000]" />
                <div className="h-1/3 bg-[#ffce00]" />
              </div>

              {/* Title & Theme */}
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {getLessonDisplayTitle(currentLesson, language)}
                </h1>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditTheme(currentLesson)}
                      title={t('lek_edit_theme_title')}
                      className="p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono underline">{t('lek_edit_theme_btn')}</span>
                    </button>
                    {lessons.length > 1 && (
                      <button
                        onClick={() => setLessonToDelete(currentLesson)}
                        title={t('delete')}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono underline">{t('delete')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Galochka: To'plam Faol */}
              <button
                onClick={() => handleToggleLessonActive(currentLesson)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  currentLesson.isActive !== false
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>
                  {currentLesson.isActive !== false ? t('lek_status_active') : t('lek_status_inactive')}
                </span>
              </button>

              {/* Word Count */}
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
                  isDark
                    ? 'text-slate-300 bg-black/40 border-white/[0.06]'
                    : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}
              >
                {currentLessonWords.length} so'z ({activeWordsCount} faol)
              </span>

              {/* Clear All Words Button */}
              {isAdmin && currentLessonWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearingAllWords(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 cursor-pointer transition-colors"
                  title={t('lek_delete_all_words')}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('lek_delete_all_words')}</span>
                </button>
              )}
            </div>

            {/* Actions: View Mode Switcher (Grid vs Flashcard) + Admin controls */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {/* Study Mode Segmented Control */}
              <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Ro'yxat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('flashcards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'flashcards'
                      ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kartochkalar</span>
                </button>
              </div>

              {isAdmin && (
                <>
                  <button
                    onClick={() => onOpenImport(currentLesson.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('lek_import_btn')}</span>
                  </button>

                  <button
                    onClick={() => onOpenAddWord(currentLesson.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                      isDark
                        ? 'text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                        : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ {t('lek_add_word_btn')}</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-xl cursor-pointer border ${
                  isDark
                    ? 'text-slate-400 hover:text-white bg-black/40 border-white/[0.06]'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
                }`}
                title={isExpanded ? 'Yig\'ish' : 'Kengaytirish'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Lesson Mastery Progress Bar (Habit visualizer) */}
          <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Ushbu Lektionni o'zlashtirish:</span>
                <span className="text-slate-400 font-mono">
                  {lessonMasteredCount} / {currentLessonWords.length} so'z yodlandi
                </span>
              </div>
              <span className="font-mono font-bold text-amber-400">{lessonMasteryPercent}%</span>
            </div>

            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm shadow-amber-500/40"
                style={{ width: `${Math.max(4, lessonMasteryPercent)}%` }}
              />
            </div>
          </div>

          {isExpanded && (
            <>
              {/* MODE 1: FLASHCARDS INTERACTIVE STUDY */}
              {viewMode === 'flashcards' && (
                <div className="space-y-4 py-2">
                  {shuffledDeck.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Bu darsda so'zlar topilmadi.
                    </div>
                  ) : (
                    <div className="max-w-xl mx-auto space-y-4">
                      {/* Deck Header */}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">
                            {cardIndex + 1} / {shuffledDeck.length}
                          </span>
                          <span>·</span>
                          <span>Kartani aylantirish uchun bosing</span>
                        </div>
                        <button
                          onClick={handleShuffleDeck}
                          className="flex items-center gap-1 hover:text-amber-400 transition-colors cursor-pointer text-[11px]"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          <span>Aralashtirish</span>
                        </button>
                      </div>

                      {/* 3D Flip Card */}
                      <div
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                        className="min-h-[260px] sm:min-h-[290px] rounded-3xl p-6 sm:p-8 cursor-pointer relative flex flex-col justify-between transition-all duration-300 border border-amber-500/30 bg-gradient-to-br from-[#161c2e] via-[#101422] to-[#0a0d16] shadow-2xl hover:border-amber-400/50"
                      >
                        {/* Top bar on card */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                            <span>{currentFlashcard.level || 'A1'}</span>
                            {currentFlashcard.article && currentFlashcard.article !== 'none' && (
                              <span
                                className={`font-bold uppercase ${
                                  currentFlashcard.article === 'der'
                                    ? 'text-sky-400'
                                    : currentFlashcard.article === 'die'
                                    ? 'text-rose-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {currentFlashcard.article}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakGerman(getFullGermanWord(currentFlashcard.german, currentFlashcard.article));
                            }}
                            className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-white/10 transition-all cursor-pointer"
                            title="Tinglash"
                          >
                            <Volume2 className="w-5 h-5 text-amber-400" />
                          </button>
                        </div>

                        {/* Center Card Content */}
                        <div className="text-center py-6 space-y-2">
                          {!isCardFlipped ? (
                            <>
                              <div className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                                {currentFlashcard.article && currentFlashcard.article !== 'none' && (
                                  <span className="text-amber-400 mr-2 font-mono text-xl sm:text-2xl">
                                    {currentFlashcard.article}
                                  </span>
                                )}
                                {getBareGerman(currentFlashcard.german)}
                              </div>
                              {currentFlashcard.plural && (
                                <p className="text-xs font-mono text-slate-400">
                                  Plural: {currentFlashcard.plural}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-500 pt-2">
                                Tarjimasini ko'rish uchun kartani bosing
                              </p>
                            </>
                          ) : (
                            <div className="space-y-3 animate-fadeIn">
                              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                O'zbekcha ma'nosi:
                              </div>
                              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                                {getWordTranslation(currentFlashcard, language)}
                              </div>
                              {(currentFlashcard.tip || currentFlashcard.exampleSentenceDe) && (
                                <p className="text-xs text-slate-300 italic max-w-sm mx-auto bg-black/40 p-2.5 rounded-xl border border-white/[0.05]">
                                  "{currentFlashcard.exampleSentenceDe || currentFlashcard.tip}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card bottom footer */}
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-white/[0.06]">
                          <span className="text-slate-400 text-[11px]">
                            {masteredIds.has(currentFlashcard.id) ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Yodlangan
                              </span>
                            ) : (
                              <span>O'rganilmoqda</span>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMastered(currentFlashcard.id);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              masteredIds.has(currentFlashcard.id)
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            }`}
                          >
                            {masteredIds.has(currentFlashcard.id) ? '✓ Yodlandi' : 'Yodladim (+3 XP)'}
                          </button>
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={handlePrevCard}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-white/[0.06]"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Oldingi</span>
                        </button>

                        <button
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Aylantirish</span>
                        </button>

                        <button
                          onClick={handleNextCard}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20"
                        >
                          <span>Keyingi</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: GRID & LIST VIEW */}
              {viewMode === 'grid' && (
                <>
                  {/* Article Filters: All, der, die, das, other */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-slate-400 font-semibold mr-1">Filtr:</span>
                    <button
                      onClick={() => setArticleFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        articleFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : isDark
                          ? 'bg-slate-900 border-white/[0.06] text-slate-400 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      Barchasi ({currentLessonWords.length})
                    </button>
                    <button
                      onClick={() => setArticleFilter('der')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        articleFilter === 'der'
                          ? 'bg-sky-500 text-white border-sky-400'
                          : isDark
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20'
                          : 'bg-sky-50 border-sky-200 text-sky-700'
                      }`}
                    >
                      der ({currentLessonWords.filter((w) => w.article === 'der').length})
                    </button>
                    <button
                      onClick={() => setArticleFilter('die')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        articleFilter === 'die'
                          ? 'bg-rose-500 text-white border-rose-400'
                          : isDark
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}
                    >
                      die ({currentLessonWords.filter((w) => w.article === 'die').length})
                    </button>
                    <button
                      onClick={() => setArticleFilter('das')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        articleFilter === 'das'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : isDark
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}
                    >
                      das ({currentLessonWords.filter((w) => w.article === 'das').length})
                    </button>
                    <button
                      onClick={() => setArticleFilter('other')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        articleFilter === 'other'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : isDark
                          ? 'bg-slate-900 border-white/[0.06] text-slate-400 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      Fe'llar & Boshqalar ({currentLessonWords.filter((w) => !w.article || w.article === 'none').length})
                    </button>
                  </div>

                  {filteredWords.length === 0 ? (
                    <div
                      className={`p-12 rounded-2xl border text-center space-y-4 ${
                        isDark ? 'bg-black/30 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">{t('lek_no_words_title')}</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          {t('lek_no_words_desc')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {filteredWords.map((word) => {
                        const isWordActive = word.isActive !== false;
                        const isMastered = masteredIds.has(word.id);

                        return (
                          <div
                            key={word.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                              isDark
                                ? isMastered
                                  ? 'bg-[#121927] border-emerald-500/30'
                                  : isWordActive
                                  ? 'bg-[#111726] border-white/[0.06] hover:border-amber-500/30'
                                  : 'bg-[#111726]/60 border-white/[0.04] opacity-60'
                                : isWordActive
                                ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 opacity-60'
                            }`}
                          >
                            {/* Top card row: Clean unboxed metadata (per frontend constitution) */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                                <span>{word.weekday || 'Lug\'at'}</span>
                                <span aria-hidden="true">·</span>
                                <span>{word.level || 'A1'}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleMastered(word.id)}
                                className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                                  isMastered
                                    ? 'text-emerald-400 hover:text-emerald-300'
                                    : 'text-slate-500 hover:text-amber-400'
                                }`}
                                title={isMastered ? 'Yodlangan deb belgilangan' : 'Yodlangan deb belgilash'}
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'text-emerald-400' : 'text-slate-600'}`} />
                                <span>{isMastered ? 'Yodlandi' : 'Yodlash'}</span>
                              </button>
                            </div>

                            {/* Word headline & Speaker icon */}
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-2">
                                {word.article === 'der' && (
                                  <span className="text-xs font-mono font-bold text-sky-400">
                                    der
                                  </span>
                                )}
                                {word.article === 'die' && (
                                  <span className="text-xs font-mono font-bold text-rose-400">
                                    die
                                  </span>
                                )}
                                {word.article === 'das' && (
                                  <span className="text-xs font-mono font-bold text-emerald-400">
                                    das
                                  </span>
                                )}

                                <h3 className="text-base sm:text-lg font-black font-sans text-white">
                                  {getBareGerman(word.german)}
                                </h3>

                                <button
                                  type="button"
                                  onClick={() => speakGerman(getFullGermanWord(word.german, word.article))}
                                  className="p-1 rounded-lg text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                                  title={t('listen')}
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopyWord(word)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                                  title="Nusxa olish"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {copiedWordId === word.id && (
                                  <span className="text-[10px] text-emerald-400 font-mono">nusxalandi!</span>
                                )}
                              </div>

                              {word.plural && (
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {t('lek_col_plural')}: <strong className="text-slate-200">{word.plural}</strong>
                                </div>
                              )}

                              <div className="text-sm font-semibold text-amber-200/90 pt-0.5">
                                {getWordTranslation(word, language)}
                              </div>
                            </div>

                            {/* Tip / Note / Example sentence */}
                            {(word.tip || word.exampleSentenceDe || word.notes) && (
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.05] text-[11px] text-slate-300 italic leading-relaxed">
                                {word.exampleSentenceDe || word.tip || word.notes}
                              </div>
                            )}

                            {/* Footer row: Date & Admin Controls */}
                            <div
                              className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
                                isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-200 text-slate-500'
                              }`}
                            >
                              <span className="text-[10px]">{word.createdAt || '2026-09-20'}</span>

                              <div className="flex items-center gap-2">
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => setWordToDelete(word)}
                                    className="px-2 py-0.5 rounded text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 cursor-pointer transition-colors text-[10px] font-semibold"
                                    title={t('delete')}
                                  >
                                    <Trash2 className="w-3 h-3 inline mr-1" />
                                    <span>{t('delete')}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => speakGerman(getFullGermanWord(word.german, word.article))}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-300 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-700 border border-white/[0.06] cursor-pointer"
                                >
                                  <Volume2 className="w-3 h-3 text-amber-400" />
                                  <span>{t('listen')}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal: Edit Theme */}
      {editingThemeLessonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
              isDark ? 'bg-[#12151e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-base font-bold flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-500" />
              <span>Lektion mavzusini kiritish / o'zgartirish</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-80">
                Mavzu nomi (Theme / Thema):
              </label>
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="Masalan: Tanishtiruv va Salomlashuv (Begrüßung)"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingThemeLessonId(null)}
                className={`px-4 py-2 rounded-xl text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => saveTheme(editingThemeLessonId)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs cursor-pointer"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Lektion */}
      {isCreatingLektion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
              isDark ? 'bg-[#12151e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-base font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              <span>Yangi Lektion darsini qo'shish</span>
            </h3>

            <form onSubmit={handleCreateLektionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 opacity-80">
                  Lektion sarlavhasi:
                </label>
                <input
                  type="text"
                  placeholder={`Lektion ${lessons.length + 1} To'plami`}
                  value={newLektionTitle}
                  onChange={(e) => setNewLektionTitle(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">
                  Dars mavzusi (Mavzuni kiritish): *
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Uy, Xonadon va Jihozlar (Wohnen)"
                  value={newLektionTheme}
                  onChange={(e) => setNewLektionTheme(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">
                  Darajasi (CEFR):
                </label>
                <select
                  value={newLektionLevel}
                  onChange={(e) => setNewLektionLevel(e.target.value as any)}
                  className={`w-full border rounded-xl p-2.5 font-mono ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingLektion(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold cursor-pointer"
                >
                  Lektionni yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal: Delete Word */}
      {wordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 ${
              isDark ? 'bg-[#12151e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">So'zni o'chirish</h3>
              <p className="text-xs text-slate-400">
                Haqiqatan ham quyidagi so'zni lug'atdan butunlay o'chirib tashlamoqchimisiz?
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-sm font-bold flex items-center gap-2 text-white">
                {wordToDelete.article !== 'none' && (
                  <span className="font-mono text-xs text-sky-400">
                    {wordToDelete.article}
                  </span>
                )}
                <span>{wordToDelete.german}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Tarjimasi: <strong className="text-slate-200">{wordToDelete.uzbek}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setWordToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteWord(wordToDelete.id);
                  setWordToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal: Clear All Words */}
      {isClearingAllWords && currentLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 ${
              isDark ? 'bg-[#12151e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Barcha so'zlarni tozalash</h3>
              <p className="text-xs text-slate-400">
                <strong>{currentLesson.title}</strong> dagi barcha <strong className="text-rose-400">{currentLessonWords.length} ta</strong> so'zni o'chirib tashlaysizmi?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearingAllWords(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  currentLessonWords.forEach((w) => onDeleteWord(w.id));
                  setIsClearingAllWords(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Ha, barchasini tozalash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal: Delete Lesson */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 ${
              isDark ? 'bg-[#12151e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Lektion darsini o'chirish</h3>
              <p className="text-xs text-slate-400">
                <strong>{lessonToDelete.title}</strong> va undagi barcha so'zlar butunlay o'chiriladi. Ushbu amalni tasdiqlaysizmi?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setLessonToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  const remainingLessons = lessons.filter((l) => l.id !== lessonToDelete.id);
                  onDeleteLesson(lessonToDelete.id);
                  setLessonToDelete(null);
                  if (remainingLessons.length > 0) {
                    setActiveLessonId(remainingLessons[0].id);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Ha, lektionni o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LektionenView;
