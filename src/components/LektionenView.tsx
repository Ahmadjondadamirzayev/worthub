import React, { useState } from 'react';
import {
  Folder,
  Calendar,
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
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  VocabularyLesson,
  WordItem,
  UserAccount,
  CefrLevel,
} from '../types/german';
import { speakGerman } from '../utils/speech';

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
}

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
}) => {
  const [activeLessonId, setActiveLessonId] = useState<string>(
    lessons[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekdayFilter, setSelectedWeekdayFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'collection' | 'schedule'>('collection');
  const [isExpanded, setIsExpanded] = useState(true);

  // Modal to edit/set Lektion theme ("mavzuni men qo'shay harbir lektionnikini")
  const [editingThemeLessonId, setEditingThemeLessonId] = useState<string | null>(null);
  const [themeInput, setThemeInput] = useState('');

  // Modal to add new Lektion
  const [isCreatingLektion, setIsCreatingLektion] = useState(false);
  const [newLektionTitle, setNewLektionTitle] = useState('');
  const [newLektionTheme, setNewLektionTheme] = useState('');
  const [newLektionLevel, setNewLektionLevel] = useState<CefrLevel>('A1');

  // Deletion confirmation modal states (100% reliable inside iframes, no window.confirm)
  const [wordToDelete, setWordToDelete] = useState<WordItem | null>(null);
  const [isClearingAllWords, setIsClearingAllWords] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<VocabularyLesson | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const isDark = theme === 'dark';

  const currentLesson =
    lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const currentLessonWords = words.filter((w) => w.setId === currentLesson?.id);

  const filteredWords = currentLessonWords.filter((w) => {
    if (selectedWeekdayFilter !== 'all' && w.weekday !== selectedWeekdayFilter) return false;
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

  // Explicit word delete handler with in-app confirmation ("so'zlarni o'chirish bo'lsin")
  const handleDeleteWordClick = (word: WordItem) => {
    setWordToDelete(word);
  };

  const handleClearAllLessonWords = () => {
    if (!currentLesson || currentLessonWords.length === 0) return;
    setIsClearingAllWords(true);
  };

  const weekdays = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

  return (
    <div className="space-y-6">
      {/* Sub-bar matching Screenshot 3: Navigation & Search */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-black/40 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setViewMode('collection');
              setSelectedWeekdayFilter('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'collection' && selectedWeekdayFilter === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Lektionlar To'plami (To'plam & Galochka)</span>
          </button>

          <button
            onClick={() => setViewMode('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'schedule'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kunlik Jadval (Hafta kunlari)</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="So'zlarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium border ${
              isDark
                ? 'bg-slate-900/80 border-slate-700/80 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>
      </div>

      {/* Weekday filter if in schedule view */}
      {viewMode === 'schedule' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedWeekdayFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
              selectedWeekdayFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : isDark
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Barchasi
          </button>
          {weekdays.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedWeekdayFilter(day)}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
                selectedWeekdayFilter === day
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Lektion Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {lessons.map((lesson) => {
          const isSelected = lesson.id === activeLessonId;
          const wordCount = words.filter((w) => w.setId === lesson.id).length;

          return (
            <button
              key={lesson.id}
              onClick={() => setActiveLessonId(lesson.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : isDark
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>Lektion {lesson.lektionNumber}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected
                    ? 'bg-black/20 text-slate-950'
                    : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {wordCount} ta
              </span>
            </button>
          );
        })}

        {isAdmin && (
          <button
            onClick={() => setIsCreatingLektion(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Yangi Lektion</span>
          </button>
        )}
      </div>

      {/* Main Lektion Container Box matching Screenshot 3 */}
      {currentLesson && (
        <div
          className={`rounded-3xl border p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden transition-all ${
            isDark
              ? 'bg-[#0d1217] border-emerald-950/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Header of Lektion */}
          <div
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
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
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {currentLesson.title}
                </h1>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditTheme(currentLesson)}
                      title="Mavzuni o'zgartirish (mavzuni men qo'shay)"
                      className="p-1 rounded-lg text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 cursor-pointer text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono underline">Mavzuni o'zgartirish</span>
                    </button>
                    {lessons.length > 1 && (
                      <button
                        onClick={() => setLessonToDelete(currentLesson)}
                        title="Ushbu lektionni o'chirish"
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono underline">Lektionni o'chirish</span>
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
                  Galochka: {currentLesson.isActive !== false ? "To'plam Faol" : "To'plam Nofaol"}
                </span>
              </button>

              {/* Word Count */}
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-lg border ${
                  isDark
                    ? 'text-slate-300 bg-slate-900 border-slate-800'
                    : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}
              >
                {currentLessonWords.length} ta so'z ({activeWordsCount} faol)
              </span>

              {/* Clear All Words Button */}
              {isAdmin && currentLessonWords.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllLessonWords}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 cursor-pointer transition-colors"
                  title="To'plamdagi barcha so'zlarni o'chirish"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Barcha so'zlarni o'chirish</span>
                </button>
              )}
            </div>

            {/* Actions: Import, Add Word, Toggle Expand */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {isAdmin && (
                <>
                  <button
                    onClick={() => onOpenImport(currentLesson.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-500 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Matndan import qilish (Shu joytida)</span>
                  </button>

                  <button
                    onClick={() => onOpenAddWord(currentLesson.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                      isDark
                        ? 'text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                        : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ So'z qo'shish</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-xl cursor-pointer border ${
                  isDark
                    ? 'text-slate-400 hover:text-white bg-slate-900 border-slate-800'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
                }`}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Words Grid matching Screenshot 3 */}
          {isExpanded && (
            <>
              {filteredWords.length === 0 ? (
                <div
                  className={`p-12 rounded-2xl border text-center space-y-4 ${
                    isDark
                      ? 'bg-black/30 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold">
                      Ushbu Lektionda hali so'zlar kiritilmagan
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Siz xohlagan vaqtingizda yangi so'zlarni birma-bir yoki matnli fayldan birdaniga import qilib qo'shishingiz mumkin.
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => onOpenImport(currentLesson.id)}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        ⚡ Matndan import qilish
                      </button>
                      <button
                        onClick={() => onOpenAddWord(currentLesson.id)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer border ${
                          isDark
                            ? 'bg-slate-800 text-slate-100 border-slate-700'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        + So'z qo'shish
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWords.map((word) => {
                    const isWordActive = word.isActive !== false;

                    return (
                      <div
                        key={word.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                          isDark
                            ? isWordActive
                              ? 'bg-[#141923] border-slate-800/80 hover:border-slate-700'
                              : 'bg-[#141923]/60 border-slate-800/40 opacity-60'
                            : isWordActive
                            ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        {/* Top card row: Weekday badge + Faol checkbox */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30 font-medium">
                            {word.weekday || 'Dushanba'}
                          </span>

                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isWordActive}
                              onChange={() => onToggleWordActive(word.id)}
                              className="w-3.5 h-3.5 rounded accent-emerald-500 cursor-pointer"
                            />
                            <span>✓ Faol</span>
                          </label>
                        </div>

                        {/* Word headline & Speaker icon */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {/* Gender badge if applicable */}
                            {word.article === 'der' && (
                              <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">
                                der
                              </span>
                            )}
                            {word.article === 'die' && (
                              <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                die
                              </span>
                            )}
                            {word.article === 'das' && (
                              <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                das
                              </span>
                            )}

                            <h3 className="text-lg font-bold font-sans flex items-center gap-1.5">
                              <span>{word.german}</span>
                            </h3>

                            <button
                              type="button"
                              onClick={() => speakGerman(word.article !== 'none' ? `${word.article} ${word.german}` : word.german)}
                              className="p-1 rounded-full text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                              title="Ovozni tinglash"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Plural if exists */}
                          {word.plural && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              Ko'pligi: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{word.plural}</strong>
                            </div>
                          )}

                          {/* Translation in Uzbek */}
                          <div className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {word.uzbek}
                          </div>
                        </div>

                        {/* Tip / Note / Example sentence box matching Screenshot 3 */}
                        {(word.tip || word.exampleSentenceDe || word.notes) && (
                          <div
                            className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-start gap-1.5 ${
                              isDark
                                ? 'bg-black/40 border-amber-500/20 text-amber-300'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            <span className="shrink-0">💡</span>
                            <span className="italic leading-relaxed">
                              {word.tip || word.exampleSentenceDe || word.notes}
                            </span>
                          </div>
                        )}

                        {/* Footer row: Date, Delete button, Audio button */}
                        <div
                          className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
                            isDark ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          <span>{word.createdAt || '2026-09-20'}</span>

                          <div className="flex items-center gap-2">
                            {/* EXPLICIT WORD DELETE BUTTON ("so'zlarni o'chirish bo'lsin") */}
                            <button
                              type="button"
                              onClick={() => handleDeleteWordClick(word)}
                              className="px-2 py-1 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold"
                              title="Ushbu so'zni ro'yxatdan butunlay o'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>O'chirish</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => speakGerman(word.article !== 'none' ? `${word.article} ${word.german}` : word.german)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] cursor-pointer border ${
                                isDark
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              }`}
                            >
                              <Volume2 className="w-3 h-3 text-amber-500" />
                              <span>Ovoz</span>
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
        </div>
      )}

      {/* Modal: Edit Theme ("mavzuni men qo'shay harbir lektionnikini") */}
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

      {/* In-App Confirmation Modal: Delete Word ("so'zlarni o'chirish bo'lsin" - 100% reliable inside iframes) */}
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
              <h3 className="text-base font-bold">So'zni o'chirish</h3>
              <p className="text-xs text-slate-400">
                Haqiqatan ham quyidagi so'zni lug'atdan butunlay o'chirib tashlamoqchimisiz?
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-sm font-bold flex items-center gap-2">
                {wordToDelete.article !== 'none' && (
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    {wordToDelete.article}
                  </span>
                )}
                <span>{wordToDelete.german}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Tarjimasi: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{wordToDelete.uzbek}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setWordToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
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

      {/* In-App Confirmation Modal: Clear All Words in Current Lesson */}
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
              <h3 className="text-base font-bold">Barcha so'zlarni tozalash</h3>
              <p className="text-xs text-slate-400">
                <strong>{currentLesson.title}</strong> dagi barcha <strong className="text-rose-400">{currentLessonWords.length} ta</strong> so'zni o'chirib tashlaysizmi?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearingAllWords(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
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
              <h3 className="text-base font-bold">Lektion darsini o'chirish</h3>
              <p className="text-xs text-slate-400">
                <strong>{lessonToDelete.title}</strong> va undagi barcha so'zlar butunlay o'chiriladi. Ushbu amalni tasdiqlaysizmi?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setLessonToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
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
