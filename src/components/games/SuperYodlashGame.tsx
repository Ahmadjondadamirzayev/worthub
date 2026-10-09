import React, { useState, useEffect } from 'react';
import {
  Zap,
  Volume2,
  RotateCw,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
} from 'lucide-react';
import { WordItem, CefrLevel } from '../../types/german';
import { ARTICLE_COLORS } from '../../utils/germanGrammar';
import { speakGerman } from '../../utils/speech';

interface SuperYodlashGameProps {
  words: WordItem[];
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
  theme?: 'dark' | 'light';
}

export const SuperYodlashGame: React.FC<SuperYodlashGameProps> = ({
  words,
  currentLevel,
  onBack,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [deck, setDeck] = useState<WordItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [speedMode, setSpeedMode] = useState<'normal' | 'turbo'>('normal');
  const [timerProgress, setTimerProgress] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const filtered =
      currentLevel === 'all'
        ? words
        : words.filter((w) => w.level === currentLevel);
    const randomized = [...(filtered.length > 0 ? filtered : words)].sort(
      () => Math.random() - 0.5
    );
    setDeck(randomized);
    setCurrentIdx(0);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsFinished(false);
    setTimerProgress(100);
  }, [words, currentLevel]);

  const currentWord = deck[currentIdx];

  // Auto pronounce
  useEffect(() => {
    if (currentWord && !isFinished) {
      const text =
        currentWord.article !== 'none'
          ? `${currentWord.article} ${currentWord.german}`
          : currentWord.german;
      speakGerman(text);
    }
  }, [currentIdx, isFinished]);

  // Reaction timer in Turbo mode
  useEffect(() => {
    if (speedMode !== 'turbo' || isFinished || !currentWord) return;

    setTimerProgress(100);
    const interval = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev <= 0) {
          handleAnswer(false);
          return 100;
        }
        return prev - 2.5; // ~4 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIdx, speedMode, isFinished]);

  const handleAnswer = (known: boolean) => {
    if (known) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }

    setIsFlipped(false);
    if (currentIdx + 1 < deck.length) {
      setCurrentIdx((prev) => prev + 1);
      setTimerProgress(100);
    } else {
      setIsFinished(true);
    }
  };

  if (!currentWord || deck.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-slate-400">
          Ushbu daraja ({currentLevel}) uchun so'zlar topilmadi.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs"
        >
          O'yinlar to'plamiga qaytish
        </button>
      </div>
    );
  }

  const artColor = ARTICLE_COLORS[currentWord.article];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'yinlar menyusiga qaytish</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSpeedMode(speedMode === 'normal' ? 'turbo' : 'normal')}
            className={`px-3 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
              speedMode === 'turbo'
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {speedMode === 'turbo' ? '⚡ Turbo Rejim (4s)' : 'Oddiy Rejim'}
          </button>

          <div className="flex items-center gap-1.5 text-amber-500 font-mono font-bold text-xs">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>Streak: {streak}x</span>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-4">
          {/* Reaction Timer line if turbo */}
          {speedMode === 'turbo' && (
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-400 transition-all duration-100"
                style={{ width: `${timerProgress}%` }}
              />
            </div>
          )}

          {/* Super-Yodlash Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full h-80 rounded-2xl border p-8 shadow-2xl flex flex-col justify-between text-center cursor-pointer select-none relative group transition-colors ${
              isDark
                ? 'border-slate-800 bg-gradient-to-b from-[#111827] to-[#0c121e] text-white'
                : 'border-slate-200 bg-white shadow-xl text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="font-mono">
                Karta: {currentIdx + 1} / {deck.length} ({currentWord.level})
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const text =
                    currentWord.article !== 'none'
                      ? `${currentWord.article} ${currentWord.german}`
                      : currentWord.german;
                  speakGerman(text);
                }}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-amber-600'
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Front / Back Toggle */}
            <div className="my-auto space-y-3">
              {!isFlipped ? (
                <>
                  <div className={`text-4xl sm:text-5xl font-extrabold font-sans tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {currentWord.article !== 'none' && (
                      <span className={`${artColor.text} mr-2 font-mono`}>
                        {currentWord.article}
                      </span>
                    )}
                    <span>{currentWord.german}</span>
                  </div>

                  {currentWord.plural && (
                    <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Ko'plik: {currentWord.plural}
                    </div>
                  )}

                  <div className={`text-[11px] font-mono pt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    O'zbekcha ma'nosini ko'rish uchun kartani bosing
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-3xl sm:text-4xl font-bold ${
                    isDark ? 'text-amber-300' : 'text-amber-600'
                  }`}>
                    {currentWord.uzbek}
                  </div>

                  {currentWord.exampleSentenceDe && (
                    <div className={`text-xs italic pt-2 max-w-md mx-auto ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      "{currentWord.exampleSentenceDe}"
                    </div>
                  )}

                  <div className={`text-[11px] font-mono pt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Orqaga qaytarish uchun bosing
                  </div>
                </>
              )}
            </div>

            <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Super-Yodlash · Reaksiya va tezkor xotira
            </div>
          </div>

          {/* Quick Reaction Decision Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold text-xs transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Bilmadim (Qaytarish)</span>
            </button>

            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 font-semibold text-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Bilyapman (To'g'ri)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Finished */
        <div className={`rounded-2xl border p-8 text-center space-y-6 ${
          isDark ? 'border-slate-800 bg-[#0f172a] text-white' : 'border-slate-200 bg-white shadow-xl text-slate-900'
        }`}>
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-500">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Super-Yodlash yakunlandi!</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Siz {deck.length} ta so'zdan {score} tasini muvaffaqiyatli xotiraga muhrladingiz.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-2xl font-bold text-emerald-500 font-mono">{score}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>O'zlashtirildi</div>
            </div>
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-2xl font-bold text-amber-500 font-mono">{maxStreak}x</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Maksimal Streak</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setDeck([...deck].sort(() => Math.random() - 0.5));
                setCurrentIdx(0);
                setIsFlipped(false);
                setScore(0);
                setStreak(0);
                setIsFinished(false);
              }}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs border cursor-pointer flex items-center gap-1.5 ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <RotateCw className="w-4 h-4" />
              <span>Qaytadan boshlash</span>
            </button>

            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs cursor-pointer"
            >
              O'yinlar menyusiga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
