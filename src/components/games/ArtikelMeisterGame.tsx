import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Volume2,
  Flame,
  RotateCw,
  Trophy,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { WordItem, CefrLevel, GermanArticle } from '../../types/german';
import { speakGerman } from '../../utils/speech';

interface ArtikelMeisterGameProps {
  words: WordItem[];
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
  theme?: 'dark' | 'light';
}

export const ArtikelMeisterGame: React.FC<ArtikelMeisterGameProps> = ({
  words,
  currentLevel,
  onBack,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [deck, setDeck] = useState<WordItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedArt, setSelectedArt] = useState<GermanArticle | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const nounWords = words.filter(
      (w) =>
        (w.article === 'der' || w.article === 'die' || w.article === 'das') &&
        (currentLevel === 'all' || w.level === currentLevel)
    );
    const randomized = [...(nounWords.length > 0 ? nounWords : words.filter((w) => w.article !== 'none'))].sort(
      () => Math.random() - 0.5
    );

    setDeck(randomized);
    setCurrentIdx(0);
    setLives(3);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedArt(null);
    setIsAnswered(false);
    setIsGameOver(false);
  }, [words, currentLevel]);

  const currentWord = deck[currentIdx];

  const handleSelectArticle = (art: GermanArticle) => {
    if (isAnswered || !currentWord || isGameOver) return;

    setSelectedArt(art);
    setIsAnswered(true);

    const isCorrect = art === currentWord.article;
    if (isCorrect) {
      setScore((prev) => prev + 10 + streak * 2);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives <= 0) {
        setIsGameOver(true);
      }
    }

    speakGerman(`${currentWord.article} ${currentWord.german}`);
  };

  const handleNext = () => {
    if (currentIdx + 1 < deck.length && lives > 0) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedArt(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
    }
  };

  if (!currentWord || deck.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-slate-400">
          Ushbu daraja ({currentLevel}) uchun otlar (artikllar) topilmadi.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs"
        >
          O'yinlar menyusiga qaytish
        </button>
      </div>
    );
  }

  const articles: Array<{ art: GermanArticle; label: string; color: string; border: string }> = [
    {
      art: 'der',
      label: 'der (Maskulin)',
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      border: 'border-blue-500',
    },
    {
      art: 'die',
      label: 'die (Feminin)',
      color: 'bg-rose-600 hover:bg-rose-500 text-white',
      border: 'border-rose-500',
    },
    {
      art: 'das',
      label: 'das (Neutral)',
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      border: 'border-emerald-500',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
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

        <div className="flex items-center gap-4 text-xs font-mono">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-4 h-4 ${
                  heart <= lives
                    ? 'fill-rose-500 text-rose-500'
                    : isDark ? 'text-slate-600 fill-slate-800' : 'text-slate-300 fill-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>Streak: {streak}x</span>
          </div>

          <div className={`${isDark ? 'text-slate-300' : 'text-slate-700'} font-bold`}>
            Ball: <span className="text-amber-500">{score}</span>
          </div>
        </div>
      </div>

      {!isGameOver && currentWord ? (
        <div className={`rounded-2xl border p-8 shadow-2xl text-center space-y-8 relative overflow-hidden transition-colors ${
          isDark ? 'border-slate-800 bg-[#0f172a] text-white' : 'border-slate-200 bg-white shadow-xl text-slate-900'
        }`}>
          <div className={`flex items-center justify-between text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>Savol: {currentIdx + 1} / {deck.length}</span>
            <span>Daraja: {currentWord.level}</span>
          </div>

          {/* Word prompt */}
          <div className="space-y-2 py-4">
            <div className={`text-4xl sm:text-5xl font-extrabold tracking-tight font-sans ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {isAnswered && (
                <span
                  className={`mr-3 font-mono ${
                    currentWord.article === 'der'
                      ? 'text-blue-500'
                      : currentWord.article === 'die'
                      ? 'text-rose-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {currentWord.article}
                </span>
              )}
              <span>{currentWord.german}</span>
            </div>

            <div className={`text-base font-medium ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
              "{currentWord.uzbek}"
            </div>

            {currentWord.plural && (
              <div className={`text-xs font-mono pt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ko'pligi: {currentWord.plural}
              </div>
            )}
          </div>

          {/* 3 Large Article Buttons */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
            {articles.map((c) => {
              const isSelected = selectedArt === c.art;
              const isCorrect = c.art === currentWord.article;

              let stateClasses = `${c.color} shadow-lg`;
              if (isAnswered) {
                if (isCorrect) {
                  stateClasses = 'bg-emerald-500 text-white ring-4 ring-emerald-500/40 font-extrabold';
                } else if (isSelected) {
                  stateClasses = 'bg-rose-600 text-white ring-4 ring-rose-500/40 opacity-70';
                } else {
                  stateClasses = isDark ? 'bg-slate-800 text-slate-500 opacity-40' : 'bg-slate-100 text-slate-400 opacity-40';
                }
              }

              return (
                <button
                  key={c.art}
                  disabled={isAnswered}
                  onClick={() => handleSelectArticle(c.art)}
                  className={`py-5 px-3 rounded-2xl font-mono text-xl sm:text-2xl font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${stateClasses}`}
                >
                  <span>{c.art}</span>
                  <span className="text-[10px] font-sans font-normal opacity-80 uppercase tracking-wider">
                    {c.art === 'der' ? 'maskulin' : c.art === 'die' ? 'feminin' : 'neutral'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom feedback */}
          {isAnswered && (
            <div className={`pt-4 border-t flex items-center justify-between ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                {selectedArt === currentWord.article ? (
                  <div className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>To'g'ri artikl! (+{10 + (streak - 1) * 2} ball)</span>
                  </div>
                ) : (
                  <div className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>Noto'g'ri! To'g'ri artikl: <strong>{currentWord.article}</strong></span>
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                {currentIdx + 1 < deck.length && lives > 0 ? 'Keyingi so\'z' : 'Natijalar'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Game Over */
        <div className={`rounded-2xl border p-8 text-center space-y-6 ${
          isDark ? 'border-slate-800 bg-[#0f172a] text-white' : 'border-slate-200 bg-white shadow-xl text-slate-900'
        }`}>
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-500">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lives > 0 ? 'Artikel-Meister yakunlandi!' : 'O\'yin tugadi (Jonlar tugadi)'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Siz to'plagan umumiy ball: <strong className="text-amber-500 font-mono text-base">{score}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-2xl font-bold text-emerald-500 font-mono">{score}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Umumiy ball</div>
            </div>
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-2xl font-bold text-amber-500 font-mono">{maxStreak}x</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Eng uzun streak</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setDeck([...deck].sort(() => Math.random() - 0.5));
                setCurrentIdx(0);
                setLives(3);
                setScore(0);
                setStreak(0);
                setIsAnswered(false);
                setIsGameOver(false);
              }}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs border cursor-pointer flex items-center gap-1.5 ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <RotateCw className="w-4 h-4" />
              <span>Qaytadan o'ynash</span>
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
