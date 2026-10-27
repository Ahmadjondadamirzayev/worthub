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
  ArrowLeft,
} from 'lucide-react';
import { WordItem, VocabularyLesson, GameModuleId, CefrLevel } from '../types/german';
import { speakGerman } from '../utils/speech';
import { useLanguage } from '../utils/i18n';
import { getBareGerman, getFullGermanWord } from '../utils/germanGrammar';
import { getWordTranslation } from '../utils/wordTranslationHelper';
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
  onAwardXp?: (amount: number, gameTitle: string) => void;
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
  onAwardXp,
}) => {
  const { t, language } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | 'all'>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [activeGameId, setActiveGameId] = useState<GameModuleId | null>(null);
  const [showWordsList, setShowWordsList] = useState(true);

  const isDark = theme === 'dark';

  // 1. Only consider active words from active lessons
  const activeLessonsIds = new Set(
    lessons.filter((l) => l.isActive !== false).map((l) => l.id)
  );
  const activeWordsBase = words.filter(
    (w) => w.isActive !== false && activeLessonsIds.has(w.setId)
  );

  // 2. Filter by Level first (per user requirement: "levelni bosganda level bo'yicha so'zlar chiqsin")
  const levelFilteredWords =
    selectedLevel === 'all'
      ? activeWordsBase
      : activeWordsBase.filter((w) => w.level === selectedLevel);

  // 3. Filter by Lesson if selected
  // Strict Lektion Filter per user requirement:
  // "manabu cefr darajasi dega joyidagi so'zlarni hammasi bo'lmasin lektion tanlab ishlaydigan qil masalan 1-lektionni tanlasa birinchi 3-lektionni tanlasa 3 bo'lsin va o'yinlar faqat shu so'zlardan iborat bo'lsin"
  const effectiveWords =
    selectedLessonId === 'all'
      ? (selectedLevel === 'all' ? activeWordsBase : activeWordsBase.filter((w) => w.level === selectedLevel))
      : activeWordsBase.filter((w) => w.setId === selectedLessonId);

  // Fallback to words if filter yields 0
  const gamePool = effectiveWords.length > 0 ? effectiveWords : (activeWordsBase.length > 0 ? activeWordsBase : words);

  const currentLessonName =
    selectedLessonId === 'all'
      ? 'Barcha Lektionlar'
      : lessons.find((l) => l.id === selectedLessonId)?.title || 'Lektion 1';

  // Active Game Component Dispatcher
  const renderActiveGameComponent = () => {
    switch (activeGameId) {
      case 'super-yodlash':
      case 'super-yodlash-reaktiv':
        return (
          <SuperYodlashGame
            words={gamePool}
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      case 'artikel-meister':
        return (
          <ArtikelMeisterGame
            words={gamePool}
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      case 'wort-paare':
        return (
          <WortPaareGame
            words={gamePool}
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      case 'blitz-wort':
        return (
          <BlitzWortGame
            words={gamePool}
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      case 'buchstabensalat':
        return (
          <BuchstabensalatGame
            words={gamePool}
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      case 'wort-quiz':
      case 'lektion-words-quiz':
      case 'horverstehen':
        return (
          <WortQuizGame
            words={gamePool}
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      case 'kasus-trainer':
      case 'plural-trainer':
      case 'perfekt-trainer':
      case 'praepositionen':
      case 'modalverben':
      case 'adjektiv-deklination':
        return (
          <KasusTrainerGame
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      case 'verb-konjugation':
        return (
          <VerbKonjugationGame
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      case 'satzbau-profi':
        return (
          <SatzbauProfiGame
            currentLevel={selectedLevel}
            onBack={() => setActiveGameId(null)}
            onAwardXp={onAwardXp}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };

  // If a game is currently active, render it with the persistent Level Header at top
  if (activeGameId) {
    const gameTitles: Record<string, string> = {
      'super-yodlash': "⚡ Super-Yodlash (Tezkor o'rganish)",
      'super-yodlash-reaktiv': "🔥 Super-Yodlash (Reaktiv rejim)",
      'artikel-meister': '🛡️ Artikel-Meister (Der, Die, Das)',
      'wort-paare': '🧩 Wort-Paare (Xotira kartalari)',
      'blitz-wort': '⏱️ Blitz-Wort (60 soniyali poyga)',
      'buchstabensalat': '🔤 Buchstabensalat (Harflar boshqotirmasi)',
      'wort-quiz': '❓ Wort-Quiz (Test sinovi)',
      'lektion-words-quiz': '📚 Lektion So\'zlari Quiz',
      'horverstehen': '🎧 Hörverstehen (Eshitish testi)',
      'kasus-trainer': '📖 Kasus-Trainer (Grammatika)',
      'verb-konjugation': '🔄 Verb-Konjugation (Fe\'llar tuslanishi)',
      'satzbau-profi': '🧱 Satzbau-Profi (Gap qurilishi)',
    };

    return (
      <div className="space-y-6">
        {/* REQUIREMENT: "o'yinlar da tepada darajalar chiqsin va va levelni bosganda level bo'yicha so'zlar chiqsin" */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border shadow-xl space-y-3.5 transition-colors ${
            isDark
              ? 'bg-[#0f131c] border-amber-500/25 text-slate-100'
              : 'bg-white border-amber-500/30 text-slate-900 shadow-sm'
          }`}
        >
          {/* Top Bar: Back button, Game Title, and Level Words Drawer Toggle */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
            isDark ? 'border-slate-800/60' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveGameId(null)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('games_back_btn')}</span>
              </button>

              <span className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {gameTitles[activeGameId] || "Interaktiv Nemis tili o'yini"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowWordsList(!showWordsList)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                showWordsList
                  ? isDark
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {selectedLevel.toUpperCase()} darajadagi so'zlar ({levelFilteredWords.length} ta)
              </span>
              {showWordsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* CEFR Level Selector Pills right at top of game */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                <span>Darajani tanlang (daraja bosilganda o'yin shu darajadagi so'zlar bilan yuklanadi):</span>
              </span>
              <span className={`font-mono text-[11px] font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {selectedLevel === 'all' ? 'Barcha darajalar' : `${selectedLevel} darajasi`} ({levelFilteredWords.length} ta so'z)
              </span>
            </div>

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
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
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
          </div>

          {/* Collapsible words display for selected level */}
          {showWordsList && (
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#151a26]/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-amber-500 pb-2 mb-2 border-b border-amber-500/20">
                <span>
                  {selectedLevel === 'all' ? t('all') : selectedLevel} - {t('games_words_list')} ({levelFilteredWords.length}):
                </span>
                <span className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('games_listen_audio_hint')}</span>
              </div>
              {levelFilteredWords.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2 text-center">
                  {t('games_no_words_in_level').replace('{level}', selectedLevel)}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                  {levelFilteredWords.map((w) => (
                    <div
                      key={w.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border ${
                        isDark
                          ? 'bg-[#1a2130] border-slate-700/80 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
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
                      <strong>{getBareGerman(w.german)}</strong>
                      <span className="text-slate-400 text-[11px]">- {getWordTranslation(w, language)}</span>
                      <button
                        onClick={() => speakGerman(getFullGermanWord(w.german, w.article))}
                        className="p-0.5 text-amber-500 hover:bg-amber-500/10 rounded cursor-pointer"
                        title={t('listen')}
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

        {/* The Game Component with dynamic key to reload on level switch */}
        <div key={`${activeGameId}-${selectedLevel}`}>
          {renderActiveGameComponent()}
        </div>
      </div>
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
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
          isDark ? 'border-slate-800/60' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-500">
              <Filter className="w-4 h-4" />
            </span>
            <span className="text-sm">🎯 {t('games_level_filter')}</span>
          </div>

          <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('level')}: <strong className="text-amber-500 font-bold">{selectedLevel.toUpperCase()}</strong> ({levelFilteredWords.length} {t('words_count')})
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
                <span>{lvl.id === 'all' ? t('all') : lvl.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-black/30 text-white'
                      : isDark
                      ? 'bg-slate-800 text-amber-400'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {count}
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
          <div className={`flex items-center justify-between pb-2 border-b text-xs ${
            isDark ? 'border-slate-800/50' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-amber-500">
              <BookOpen className="w-4 h-4" />
              <span>
                {selectedLevel === 'all' ? t('all') : selectedLevel} - {t('games_words_list')} ({levelFilteredWords.length}):
              </span>
            </div>

            <button
              onClick={() => setShowWordsList(!showWordsList)}
              className={`text-[11px] hover:text-amber-500 flex items-center gap-1 cursor-pointer font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <span>{showWordsList ? t('games_hide') : t('games_show')}</span>
              {showWordsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showWordsList && (
            <div className="pt-3">
              {levelFilteredWords.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2 text-center">
                  {t('games_no_words_in_level').replace('{level}', selectedLevel)}
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
                      <span className="text-slate-400 text-[11px]">- {getWordTranslation(w, language)}</span>
                      <button
                        onClick={() => speakGerman(w.article !== 'none' ? `${w.article} ${w.german}` : w.german)}
                        className="p-1 rounded text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                        title={t('listen')}
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
            <span>{t('games_select_lesson')}</span>
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
              {t('all')}
            </button>
            {lessons.map((les) => {
              const label = language === 'ru' ? `Урок ${les.lektionNumber}` : language === 'en' ? `Lesson ${les.lektionNumber}` : `Lektion ${les.lektionNumber}`;
              return (
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
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 1: SO'Z BOYLIGI O'YINLARI (7 TA O'YIN) matching Screenshot 4 */}
      <div className="space-y-3">
        <div className={`flex items-center gap-2 text-xs font-extrabold tracking-wider font-mono uppercase ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <span>📚 {t('games_sec_vocab')}</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px]">
            {language === 'ru' ? `7 ИГР • (${gamePool.length} СЛОВ)` : language === 'en' ? `7 GAMES • (${gamePool.length} WORDS)` : `7 TA O'YIN • (${gamePool.length} TA SO'Z BILAN)`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {/* 1. Super-Yodlash (Active yellow card) */}
          <button
            onClick={() => setActiveGameId('super-yodlash')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-amber-500/15"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5"><span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[10px] font-bold shadow-xs">🔴 Eng qiyin</span><span className="px-2 py-0.5 rounded-md bg-black/30 text-amber-300 font-mono text-[10px] font-extrabold">⚡ +50 ball</span></div>
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-950">{t('game_super_title')}</div>
              <div className="text-[11px] font-medium text-slate-900 mt-0.5">{t('game_super_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span><span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +35 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                {t('game_artikel_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_artikel_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">🟢 Oson</span><span className="text-[10px] font-mono font-extrabold text-emerald-400">⚡ +10 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                {t('game_paare_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_paare_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 O'rta</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +25 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                {t('game_blitz_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_blitz_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 O'rta</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +30 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                {t('game_buchstaben_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_buchstaben_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">🟢 Oson</span>
              <span className="text-[10px] font-mono font-extrabold text-emerald-400">⚡ +15 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                {t('game_quiz_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_quiz_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +35 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                {t('game_listen_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_listen_sub')}</div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: GRAMMATIKA & LUG'AT O'YINLARI (12 TA O'YIN) matching Screenshot 4 */}
      <div className="space-y-3">
        <div className={`flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-wider font-mono uppercase ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <span>🎓 {t('games_sec_grammar_title')}</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px]">
            {t('games_sec_grammar_count')}
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
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">🟢 Oson</span>
              <span className="text-[10px] font-mono font-extrabold text-emerald-400">⚡ +15 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_lektion_words_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_lektion_words_sub')}</div>
            </div>
          </button>

          {/* G2. Super-Yodlash (Reaktiv) - Yellow card */}
          <button
            onClick={() => setActiveGameId('super-yodlash-reaktiv')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-amber-500/15"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[10px] font-bold">🔴 Eng qiyin</span>
              <span className="px-2 py-0.5 rounded-md bg-black/30 text-amber-300 font-mono text-[10px] font-extrabold">⚡ +50 ball</span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-950">{t('game_super_reaktiv_title')}</div>
              <div className="text-[11px] font-medium text-slate-900 mt-0.5">{t('game_super_reaktiv_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +35 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_artikel_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_artikel_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 O'rta</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +25 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_plural_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_plural_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +45 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_kasus_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_kasus_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +40 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_verb_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_verb_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[10px] font-bold">🔴 Eng qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +50 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_satzbau_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_satzbau_sub')}</div>
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +45 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_perfekt_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_perfekt_sub')}</div>
            </div>
          </button>

          {/* G9. Präpositionen (Wo? vs Wohin?) */}
          <button
            onClick={() => setActiveGameId('praepositionen')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +40 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_praepositionen_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_praepositionen_sub')}</div>
            </div>
          </button>

          {/* G10. Modalverben */}
          <button
            onClick={() => setActiveGameId('modalverben')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +35 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_modalverben_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_modalverben_sub')}</div>
            </div>
          </button>

          {/* G11. Adjektiv-Deklination */}
          <button
            onClick={() => setActiveGameId('adjektiv-deklination')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all cursor-pointer group ${
              isDark ? 'bg-[#12151e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">🟡 Qiyin</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400">⚡ +45 ball</span>
            </div>
            <div>
              <div className="font-bold text-sm group-hover:text-amber-500">
                {t('game_adjektiv_title')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('game_adjektiv_sub')}</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
