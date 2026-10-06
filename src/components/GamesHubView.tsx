import React, { useState } from 'react';
import {
  Zap,
  Flame,
  Layers,
  Timer,
  SpellCheck,
  HelpCircle,
  Volume2,
  BookOpen,
  GitCompare,
  FileCode2,
  Calendar,
  Check,
  Clock,
  Compass,
  Palette,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WordItem, VocabularyLesson, GameModuleId, CefrLevel } from '../types/german';
import { speakGerman } from '../utils/speech';
import { SuperYodlashGame } from './games/SuperYodlashGame';
import { ArtikelMeisterGame } from './games/ArtikelMeisterGame';
import { WortPaareGame } from './games/WortPaareGame';
import { BlitzWortGame } from './games/BlitzWortGame';
import { BuchstabensalatGame } from './games/BuchstabensalatGame';
import { WortQuizGame } from './games/WortQuizGame';
import { KasusTrainerGame } from './games/KasusTrainerGame';
import { VerbKonjugationGame } from './games/VerbKonjugationGame';
import { SatzbauProfiGame } from './games/SatzbauProfiGame';

interface GamesHubViewProps {
  words: WordItem[];
  lessons: VocabularyLesson[];
  theme?: 'dark' | 'light';
}

const CEFR_LEVELS: { id: CefrLevel | 'all'; label: string; desc: string }[] = [
  { id: 'all', label: 'Barchasi', desc: 'A1–C2 to\'liq' },
  { id: 'A1', label: 'A1', desc: 'Boshlang\'ich' },
  { id: 'A2', label: 'A2', desc: 'Asosiy' },
  { id: 'B1', label: 'B1', desc: 'O\'rta' },
  { id: 'B2', label: 'B2', desc: 'Mustaqil' },
  { id: 'C1', label: 'C1', desc: 'Ilg\'or' },
  { id: 'C2', label: 'C2', desc: 'Mukammal' },
];

export const GamesHubView: React.FC<GamesHubViewProps> = ({
  words,
  lessons,
  theme = 'dark',
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | 'all'>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [activeGameId, setActiveGameId] = useState<GameModuleId | null>(null);
  const [showWordsList, setShowWordsList] = useState(true);

  const isDark = theme === 'dark';

  // 1. Filter by Level first (per user requirement: "levelni bosganda level bo'yicha so'zlar chiqsin")
  const levelFilteredWords =
    selectedLevel === 'all'
      ? words
      : words.filter((w) => w.level === selectedLevel);

  // 2. Filter by Lesson if selected
  const effectiveWords =
    selectedLessonId === 'all'
      ? levelFilteredWords
      : levelFilteredWords.filter((w) => w.setId === selectedLessonId);

  // Fallback to words if filter yields 0
  const gamePool = effectiveWords.length > 0 ? effectiveWords : words;

  const currentLessonName =
    selectedLessonId === 'all'
      ? 'Barcha Lektionlar'
      : lessons.find((l) => l.id === selectedLessonId)?.title || 'Lektion 1';

  // Game Runner
  if (activeGameId === 'super-yodlash' || activeGameId === 'super-yodlash-reaktiv') {
    return (
      <SuperYodlashGame
        words={gamePool}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'artikel-meister') {
    return (
      <ArtikelMeisterGame
        words={gamePool}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'wort-paare') {
    return (
      <WortPaareGame
        words={gamePool}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'blitz-wort') {
    return (
      <BlitzWortGame
        words={gamePool}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'buchstabensalat') {
    return (
      <BuchstabensalatGame
        words={gamePool}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'wort-quiz' || activeGameId === 'lektion-words-quiz') {
    return (
      <WortQuizGame
        words={gamePool}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'horverstehen') {
    return (
      <WortQuizGame
        words={gamePool}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'kasus-trainer') {
    return (
      <KasusTrainerGame
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'verb-konjugation') {
    return (
      <VerbKonjugationGame
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'satzbau-profi') {
    return (
      <SatzbauProfiGame
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  // Fallbacks for specialized grammar trainers
  if (
    activeGameId === 'plural-trainer' ||
    activeGameId === 'perfekt-trainer' ||
    activeGameId === 'praepositionen' ||
    activeGameId === 'modalverben' ||
    activeGameId === 'adjektiv-deklination'
  ) {
    return (
      <KasusTrainerGame
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* REQUIREMENT: "o'yinlar da tepada darajalar chiqsin va va levelni bosganda level bo'yicha so'zlar chiqsin" */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-4 ${
          isDark
            ? 'bg-[#0f131c] border-amber-500/20 text-slate-100'
            : 'bg-white border-amber-500/30 text-slate-900 shadow-sm'
        }`}
      >
        {/* Level Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-500">
              <Filter className="w-4 h-4" />
            </span>
            <span className="text-sm">🎯 Til darajasi bo'yicha tanlash (Level):</span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Tanlangan daraja: <strong className="text-amber-500 font-bold">{selectedLevel.toUpperCase()}</strong> ({levelFilteredWords.length} ta so'z)
          </div>
        </div>

        {/* Level Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CEFR_LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            const count =
              lvl.id === 'all'
                ? words.length
                : words.filter((w) => w.level === lvl.id).length;

            return (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white border-amber-400 shadow-md shadow-orange-600/20 scale-[1.02]'
                    : isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>{lvl.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-black/30 text-white'
                      : isDark
                      ? 'bg-slate-800 text-amber-400'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {count} ta
                </span>
              </button>
            );
          })}
        </div>

        {/* WORDS DISPLAY FOR SELECTED LEVEL (Per user requirement: "levelni bosganda level bo'yicha so'zlar chiqsin") */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark
              ? 'bg-[#151a26]/90 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/50 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-500">
              <BookOpen className="w-4 h-4" />
              <span>
                {selectedLevel === 'all' ? 'Barcha darajadagi' : `${selectedLevel} darajadagi`} so'zlar ro'yxati ({levelFilteredWords.length} ta):
              </span>
            </div>

            <button
              onClick={() => setShowWordsList(!showWordsList)}
              className="text-[11px] text-slate-400 hover:text-amber-500 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>{showWordsList ? 'Yashirish' : "Ko'rsatish"}</span>
              {showWordsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showWordsList && (
            <div className="pt-3">
              {levelFilteredWords.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2 text-center">
                  Ushbu {selectedLevel} darajada hali so'zlar kiritilmagan. Lektionlar bo'limidan yangi so'zlar qo'shishingiz mumkin.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                  {levelFilteredWords.map((w) => (
                    <div
                      key={w.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                        isDark
                          ? 'bg-[#1a2130] border-slate-700/80 text-slate-100 hover:border-amber-400'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-amber-500 shadow-2xs'
                      }`}
                    >
                      {w.article === 'der' && (
                        <span className="font-bold text-[10px] text-blue-400 font-mono">der</span>
                      )}
                      {w.article === 'die' && (
                        <span className="font-bold text-[10px] text-rose-400 font-mono">die</span>
                      )}
                      {w.article === 'das' && (
                        <span className="font-bold text-[10px] text-emerald-400 font-mono">das</span>
                      )}
                      <strong className="font-semibold">{w.german}</strong>
                      <span className="text-slate-400 text-[11px]">- {w.uzbek}</span>
                      <button
                        onClick={() => speakGerman(w.article !== 'none' ? `${w.article} ${w.german}` : w.german)}
                        className="p-1 rounded text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                        title="Tinglash"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lektion selector sub-bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Leksiyani tanlang (ixtiyoriy):</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedLessonId('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                selectedLessonId === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-400'
                  : 'bg-slate-100 border border-slate-200 text-slate-600'
              }`}
            >
              Barchasi
            </button>
            {lessons.map((les) => (
              <button
                key={les.id}
                onClick={() => setSelectedLessonId(les.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  selectedLessonId === les.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-400'
                    : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}
              >
                Lektion {les.lektionNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 1: SO'Z BOYLIGI O'YINLARI (7 TA O'YIN) matching Screenshot 4 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-slate-400 font-mono uppercase">
          <span>📚 SO'Z BOYLIGI O'YINLARI</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px]">
            7 TA O'YIN • ({gamePool.length} TA SO'Z BILAN)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {/* 1. Super-Yodlash (Active yellow card) */}
          <button
            onClick={() => setActiveGameId('super-yodlash')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-amber-500/15"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-black/20 font-mono text-[10px] font-bold">
                ⚡ 0.8s
              </span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-950">Super-Yodlash</div>
              <div className="text-[11px] font-medium text-slate-900 mt-0.5">Tezkor yodlash (+30 XP)</div>
            </div>
          </button>

          {/* 2. Artikel-Meister */}
          <button
            onClick={() => setActiveGameId('artikel-meister')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                der • die • das
              </span>
              <span className="text-xs">🏆</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                Artikel-Meister
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Artikl topish (+10 XP)</div>
            </div>
          </button>

          {/* 3. Wort-Paare */}
          <button
            onClick={() => setActiveGameId('wort-paare')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <Layers className="w-4 h-4 text-emerald-400" />
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                Wort-Paare
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Xotira kartalari (+15 XP)</div>
            </div>
          </button>

          {/* 4. Blitz-Wort (60s) */}
          <button
            onClick={() => setActiveGameId('blitz-wort')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <Zap className="w-4 h-4 text-rose-400" />
              <Timer className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                Blitz-Wort (60s)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tezkor poyga (+10 XP)</div>
            </div>
          </button>

          {/* 5. Buchstabensalat */}
          <button
            onClick={() => setActiveGameId('buchstabensalat')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <SpellCheck className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-mono text-purple-400 font-bold">A-B-C</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                Buchstabensalat
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Harflar terish (+20 XP)</div>
            </div>
          </button>

          {/* 6. Wort-Quiz */}
          <button
            onClick={() => setActiveGameId('wort-quiz')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs">🔖</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                Wort-Quiz
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Sinov testi (+15 XP)</div>
            </div>
          </button>

          {/* 7. Hörverstehen */}
          <button
            onClick={() => setActiveGameId('horverstehen')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <Volume2 className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-mono text-teal-400">Audio</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                Hörverstehen
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tinglab topish (+15 XP)</div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: GRAMMATIKA & LUG'AT O'YINLARI (12 TA O'YIN) matching Screenshot 4 */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-wider text-slate-400 font-mono uppercase">
          <span>🎓 NEMIS TILI GRAMMATIKA & LUG'AT O'YINLARI (GRAMMATIK & WORTSCHATZ)</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px]">
            YANGI • 12 TA O'YIN
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* G1. Lug'atdagi so'zlar o'yini */}
          <button
            onClick={() => setActiveGameId('lektion-words-quiz')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                Lug'at
              </span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Lug'atdagi so'zlar o'yini
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Leksiya so'zlari testi (+15 XP)</div>
            </div>
          </button>

          {/* G2. Super-Yodlash (Reaktiv) - Yellow card */}
          <button
            onClick={() => setActiveGameId('super-yodlash-reaktiv')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-amber-500/15"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-black/20 font-mono text-[10px] font-bold">
                ⚡ 0.8s
              </span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-950">Super-Yodlash (Reaktiv)</div>
              <div className="text-[11px] font-medium text-slate-900 mt-0.5">Hali so'ramasdanoq aytish (+35 XP)</div>
            </div>
          </button>

          {/* G3. Artikel-Meister */}
          <button
            onClick={() => setActiveGameId('artikel-meister')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                der • die • das
              </span>
              <span className="text-xs">🎯</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Artikel-Meister
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Otlar jinsi (+10 XP)</div>
            </div>
          </button>

          {/* G4. Plural-Trainer */}
          <button
            onClick={() => setActiveGameId('plural-trainer')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                -e • -(e)n • -er
              </span>
              <span className="text-xs">📚</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Plural-Trainer
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Leksiya otlari ko'pligi (+15 XP)</div>
            </div>
          </button>

          {/* G5. Kasus-Trainer */}
          <button
            onClick={() => setActiveGameId('kasus-trainer')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                Akk • Dat • Gen
              </span>
              <span className="text-xs">🎯</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Kasus-Trainer
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Kelishik & predloglar (+15 XP)</div>
            </div>
          </button>

          {/* G6. Verb-Konjugation */}
          <button
            onClick={() => setActiveGameId('verb-konjugation')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                ich • du • er
              </span>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Verb-Konjugation
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Fe'l tuslash & o'zaklar (+15 XP)</div>
            </div>
          </button>

          {/* G7. Satzbau-Profi */}
          <button
            onClick={() => setActiveGameId('satzbau-profi')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Verb Pos. 2
              </span>
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Satzbau-Profi
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Nemischa gap tuzish (+25 XP)</div>
            </div>
          </button>

          {/* G8. Perfekt & Partizip II */}
          <button
            onClick={() => setActiveGameId('perfekt-trainer')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                haben • sein
              </span>
              <Clock className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Perfekt & Partizip II
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">O'tgan zamon ustasi (+20 XP)</div>
            </div>
          </button>

          {/* G9. Plural-Trainer (Ko'plik yasalishi) */}
          <button
            onClick={() => setActiveGameId('plural-trainer')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                -e • -(e)n • -er
              </span>
              <span className="text-xs">📚</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Plural-Trainer
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ko'plik yasalishi (+15 XP)</div>
            </div>
          </button>

          {/* G10. Präpositionen (Wo? vs Wohin?) */}
          <button
            onClick={() => setActiveGameId('praepositionen')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
                Wo? vs Wohin?
              </span>
              <Compass className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Präpositionen
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Wechselpräpositionen (+15 XP)</div>
            </div>
          </button>

          {/* G11. Modalverben */}
          <button
            onClick={() => setActiveGameId('modalverben')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">
                können • müssen
              </span>
              <span className="text-xs">🔑</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Modalverben
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Modal fe'llar ustasi (+15 XP)</div>
            </div>
          </button>

          {/* G12. Adjektiv-Deklination */}
          <button
            onClick={() => setActiveGameId('adjektiv-deklination')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                -e • -en • -es • -er
              </span>
              <Palette className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                Adjektiv-Deklination
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Sifat qo'shimchalari (+15 XP)</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
