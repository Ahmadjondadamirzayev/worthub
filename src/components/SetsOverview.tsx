import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  FolderPlus,
  Lock,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { VocabularyLesson, WordItem, CefrLevel, UserAccount } from '../types/german';
import { CEFR_COLORS, CEFR_DESCRIPTIONS_UZ } from '../utils/germanGrammar';
import { GermanFlagBadge } from './GermanFlagBackdrop';

interface SetsOverviewProps {
  lessons: VocabularyLesson[];
  words: WordItem[];
  currentUser: UserAccount;
  onSelectLesson: (lesson: VocabularyLesson) => void;
  onCreateLesson: (title: string, germanTitle: string, description: string, level: CefrLevel) => void;
}

export const SetsOverview: React.FC<SetsOverviewProps> = ({
  lessons,
  words,
  currentUser,
  onSelectLesson,
  onCreateLesson,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGermanTitle, setNewGermanTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLevel, setNewLevel] = useState<CefrLevel>('A1');

  const isAdmin = currentUser.role === 'admin';

  const filteredLessons = lessons.filter((s) => {
    if (selectedLevel !== 'all' && s.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.germanTitle?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateLesson(
      newTitle.trim(),
      newGermanTitle.trim() || newTitle.trim(),
      newDesc.trim(),
      newLevel
    );
    setNewTitle('');
    setNewGermanTitle('');
    setNewDesc('');
    setIsCreatingLesson(false);
  };

  const levels: Array<CefrLevel | 'all'> = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner with German Flag Theme */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#111827]/90 to-[#0c121d]/90 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        {/* Subtle German flag ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-[#111]" />
          <div className="w-1/3 bg-[#de0000]" />
          <div className="w-1/3 bg-[#ffce00]" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <GermanFlagBadge size="sm" />
              <span>Assalomu alaykum, {currentUser.name}!</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-mono">
                {words.length} ta o'rganiladigan so'z
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Nemis tili darslari (Lektionen)
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Lug'at darslar (Lektionen) bo'yicha tashkillashtirilgan. O'rganish uchun darsni tanlang va kartalar, viktorina hamda der/die/das o'yinlarida mashq qiling.
            </p>

            {/* Student Assigned Level notification */}
            {!isAdmin && (
              <div className="inline-flex items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400">Sizning biriktirilgan darajangiz:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold border ${CEFR_COLORS[currentUser.assignedLevel]}`}>
                  {currentUser.assignedLevel} · {CEFR_DESCRIPTIONS_UZ[currentUser.assignedLevel]}
                </span>
              </div>
            )}
          </div>

          {/* Only Admin can create new lessons */}
          {isAdmin && (
            <button
              onClick={() => setIsCreatingLesson(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-red-500 to-amber-400 hover:opacity-95 rounded-lg transition-all cursor-pointer shadow-sm shadow-amber-500/10 whitespace-nowrap self-start sm:self-auto"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Yangi Lektion qo'shish</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar in Uzbek */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
        {/* CEFR Level filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedLevel === lvl
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {lvl === 'all' ? 'Barcha darajalar' : lvl}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Dars yoki mavzu izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Modal for Admin to create lesson */}
      {isCreatingLesson && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>Yangi Lektion darsini yaratish (Admin)</span>
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Dars nomi (O'zbekcha) *
                </label>
                <input
                  type="text"
                  placeholder="masalan: Lektion 8: Universitet va Ta'lim"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nemischa sarlavha (German title)
                </label>
                <input
                  type="text"
                  placeholder="masalan: Universität & Studium"
                  value={newGermanTitle}
                  onChange={(e) => setNewGermanTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Qaysi daraja uchun (CEFR)?
                </label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as CefrLevel)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="A1">A1 (Boshlang'ich)</option>
                  <option value="A2">A2 (Boshlang'ich-davomiy)</option>
                  <option value="B1">B1 (O'rta daraja)</option>
                  <option value="B2">B2 (Mustaqil daraja)</option>
                  <option value="C1">C1 (Yuqori daraja)</option>
                  <option value="C2">C2 (Mukammal daraja)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Dars tavsifi
                </label>
                <textarea
                  rows={2}
                  placeholder="Darsda o'rganiladigan asosiy mavzular va so'zlar haqida qisqacha..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingLesson(false)}
                  className="px-3.5 py-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Darsni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lessons (Lektionen) Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map((lesson) => {
          const lessonWords = words.filter((w) => w.setId === lesson.id);
          const isUserLevel = !isAdmin && lesson.level === currentUser.assignedLevel;

          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-4 ${
                isUserLevel
                  ? 'border-amber-500/40 bg-[#121727] hover:border-amber-400/80 shadow-lg shadow-amber-500/5'
                  : 'border-slate-800 bg-[#111827]/70 hover:border-slate-700 hover:bg-[#111827]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${CEFR_COLORS[lesson.level]}`}
                    >
                      {lesson.level}
                    </span>
                    {isUserLevel && (
                      <span className="text-[10px] font-mono text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                        Sizning darajangiz
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {lessonWords.length} ta so'z
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {lesson.title}
                </h2>
                <div className="text-xs text-amber-400/80 font-mono">
                  {lesson.germanTitle}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  5 ta interaktiv o'yin mavjud
                </span>

                <span className="inline-flex items-center gap-1 text-amber-400 group-hover:translate-x-0.5 transition-transform font-medium">
                  Mashq qilish <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
