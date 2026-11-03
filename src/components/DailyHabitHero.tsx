import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Volume2,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Target,
  Zap,
  BookOpen,
  RotateCw,
  Compass,
} from 'lucide-react';
import { UserAccount, WordItem, VocabularyLesson } from '../types/german';
import { speakGerman } from '../utils/speech';
import { getBareGerman, getFullGermanWord } from '../utils/germanGrammar';
import { getWordTranslation } from '../utils/wordTranslationHelper';
import { useLanguage } from '../utils/i18n';

interface DailyHabitHeroProps {
  currentUser: UserAccount;
  words: WordItem[];
  lessons: VocabularyLesson[];
  onStartPractice: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenLeaderboard: () => void;
  onAwardXp: (amount: number, reason: string) => void;
}

const STORAGE_KEY_DAILY_MASTERED = 'worthub_daily_mastered_words_v1';
const STORAGE_KEY_WORD_OF_DAY_CLAIMED = 'worthub_word_of_day_claimed_';

export const DailyHabitHero: React.FC<DailyHabitHeroProps> = ({
  currentUser,
  words,
  lessons,
  onStartPractice,
  onOpenLesson,
  onOpenLeaderboard,
  onAwardXp,
}) => {
  const { language } = useLanguage();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Daily mastered word IDs for today
  const [dailyMastered, setDailyMastered] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_DAILY_MASTERED}_${todayStr}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  // Track if word of day XP was claimed today
  const [wordClaimed, setWordClaimed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY_WORD_OF_DAY_CLAIMED}_${todayStr}`) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Select a curated or deterministic Word of the Day based on date
  const wordOfTheDay = React.useMemo(() => {
    if (!words || words.length === 0) return null;
    const dateNum = todayStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
    const index = Math.abs(dateNum * 17) % words.length;
    return words[index] || words[0];
  }, [words, todayStr]);

  const targetDailyGoal = 15; // 15 words per day goal
  const currentCount = dailyMastered.length;
  const progressPercent = Math.min(100, Math.round((currentCount / targetDailyGoal) * 100));

  const handleSpeakWord = () => {
    if (!wordOfTheDay) return;
    setIsSpeaking(true);
    speakGerman(getFullGermanWord(wordOfTheDay.german, wordOfTheDay.article));
    setTimeout(() => setIsSpeaking(false), 1200);
  };

  const handleClaimWordOfDay = () => {
    if (wordClaimed || !wordOfTheDay) return;
    setWordClaimed(true);
    try {
      localStorage.setItem(`${STORAGE_KEY_WORD_OF_DAY_CLAIMED}_${todayStr}`, 'true');
    } catch (e) {}

    // Add to daily mastered
    if (!dailyMastered.includes(wordOfTheDay.id)) {
      const updated = [...dailyMastered, wordOfTheDay.id];
      setDailyMastered(updated);
      try {
        localStorage.setItem(`${STORAGE_KEY_DAILY_MASTERED}_${todayStr}`, JSON.stringify(updated));
      } catch (e) {}
    }

    onAwardXp(10, "Kun so'zini o'rgangani uchun");
  };

  const articleColor =
    wordOfTheDay?.article === 'der'
      ? 'text-sky-400'
      : wordOfTheDay?.article === 'die'
      ? 'text-rose-400'
      : wordOfTheDay?.article === 'das'
      ? 'text-emerald-400'
      : 'text-amber-400';

  const articleBg =
    wordOfTheDay?.article === 'der'
      ? 'bg-sky-500/10 border-sky-500/20'
      : wordOfTheDay?.article === 'die'
      ? 'bg-rose-500/10 border-rose-500/20'
      : wordOfTheDay?.article === 'das'
      ? 'bg-emerald-500/10 border-emerald-500/20'
      : 'bg-amber-500/10 border-amber-500/20';

  // Format today's date nicely in Uzbek
  const todayFormatted = new Intl.DateTimeFormat('uz-UZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#111726] to-[#0a0d16] p-4 sm:p-6 shadow-2xl mb-6">
      {/* Subtle German Flag Accent Line along top */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="w-1/3 bg-black/60" />
        <div className="w-1/3 bg-red-600/80" />
        <div className="w-1/3 bg-amber-400/80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-1">
        {/* Left Column: Daily Goal & Streak Motivation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-400 capitalize">
              <span>{todayFormatted}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-medium">Blitz Nemis Tili</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Xush kelibsiz, {currentUser.name || "O'quvchi"}!</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Har kuni atigi 15 ta nemischa so'zni takrorlang va 30 kunda 450+ ta yangi so'zni mustahkam yodlang!
            </p>
          </div>

          {/* Daily Goal Visual Bar */}
          <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-200">Bugungi maqsad</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 font-mono">
                  {currentCount} / {targetDailyGoal} so'z
                </span>
              </div>
              <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
            </div>

            {/* Glowing progress bar */}
            <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-700 shadow-sm shadow-amber-500/50"
                style={{ width: `${Math.max(6, progressPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>
                {progressPercent >= 100
                  ? "🎉 Bugungi maqsad bajarildi! Ajoyib natija!"
                  : `Yana ${Math.max(0, targetDailyGoal - currentCount)} ta so'z qoldi`}
              </span>
              <span className="text-amber-400/90 font-mono">+15 XP kunlik bonus</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={onStartPractice}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-bold text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <Zap className="w-4 h-4" />
              <span>O'yinlarda mashq qilish</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            {lessons[0] && (
              <button
                onClick={() => onOpenLesson(lessons[0].id)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/[0.08] text-slate-200 font-semibold text-xs active:scale-98 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Lektionlarni ko'rish</span>
              </button>
            )}

            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-slate-300 hover:text-amber-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Reyting ({currentUser.xp || 0} XP)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Featured "Kun So'zi" (Wort des Tages) card (5 cols) */}
        {wordOfTheDay && (
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#182033] to-[#0f1422] border border-amber-500/20 p-4 sm:p-5 relative overflow-hidden shadow-xl">
            {/* Ambient gold glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>KUN SO'ZI · WORT DES TAGES</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{wordOfTheDay.level || 'A1'}</span>
              </div>

              {/* German Word Presentation */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  {wordOfTheDay.article && wordOfTheDay.article !== 'none' && (
                    <span className={`text-base sm:text-lg font-mono font-bold ${articleColor}`}>
                      {wordOfTheDay.article}
                    </span>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {getBareGerman(wordOfTheDay.german)}
                  </h3>
                  <button
                    onClick={handleSpeakWord}
                    className={`p-1.5 rounded-full text-slate-300 hover:text-amber-400 hover:bg-white/10 transition-all cursor-pointer ${
                      isSpeaking ? 'scale-110 text-amber-400' : ''
                    }`}
                    title="Talaffuzni tinglash"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {wordOfTheDay.plural && (
                  <p className="text-[11px] font-mono text-slate-400">
                    Ko'pligi: <span className="text-slate-200">{wordOfTheDay.plural}</span>
                  </p>
                )}

                <p className="text-sm font-semibold text-amber-300 pt-0.5">
                  {getWordTranslation(wordOfTheDay, language)}
                </p>
              </div>

              {/* Example sentence or tip */}
              {(wordOfTheDay.tip || wordOfTheDay.exampleSentenceDe) && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-slate-300 italic leading-relaxed">
                  "{wordOfTheDay.exampleSentenceDe || wordOfTheDay.tip}"
                </div>
              )}
            </div>

            {/* Claim button */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{currentUser.streakDays || 1} kun faol</span>
              </div>

              <button
                onClick={handleClaimWordOfDay}
                disabled={wordClaimed}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  wordClaimed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-md shadow-amber-500/20'
                }`}
              >
                {wordClaimed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Yodlandi (+10 XP)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Yodladim (+10 XP)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
