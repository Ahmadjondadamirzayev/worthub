import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  XCircle,
  Flame,
  RotateCw,
  Trophy,
} from 'lucide-react';
import { WordItem, VocabularyLesson, GermanArticle } from '../types/german';
import { speakGerman } from '../utils/speech';

interface ArticlesGameModeProps {
  currentLesson: VocabularyLesson;
  words: WordItem[];
  onBackToLesson: () => void;
}

export const ArticlesGameMode: React.FC<ArticlesGameModeProps> = ({
  currentLesson,
  words,
  onBackToLesson,
}) => {
  // Only test nouns that have an article (der, die, das)
  const nounWords = words.filter(
    (w) => w.article === 'der' || w.article === 'die' || w.article === 'das'
  );

  const [deck, setDeck] = useState<WordItem[]>(nounWords);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<GermanArticle | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setDeck([...nounWords].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setSelectedArticle(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsFinished(false);
  }, [words]);

  const currentWord = deck[currentIdx];

  const handleSelectArticle = (choice: GermanArticle) => {
    if (isAnswered || !currentWord) return;

    setSelectedArticle(choice);
    setIsAnswered(true);

    const isCorrect = choice === currentWord.article;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }

    // Pronounce the full correct term
    speakGerman(`${currentWord.article} ${currentWord.german}`);
  };

  const handleNext = () => {
    if (currentIdx + 1 < deck.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedArticle(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (nounWords.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-slate-400">
          Ushbu darsda artiklga ega otlar (der/die/das) topilmadi.
        </p>
        <button
          onClick={onBackToLesson}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs"
        >
          Darsga qaytish
        </button>
      </div>
    );
  }

  const choices: Array<{ art: GermanArticle; label: string; color: string; border: string }> = [
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
          onClick={onBackToLesson}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentLesson.title} darsiga qaytish</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Streak: {streak}x</span>
          </div>
          <div className="text-slate-300">
            Ball: <strong className="text-emerald-400">{score}</strong> / {deck.length}
          </div>
        </div>
      </div>

      {!isFinished && currentWord ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Ot: {currentIdx + 1} / {deck.length}</span>
              <span>{Math.round(((currentIdx + 1) / deck.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / deck.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Game Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl text-center space-y-8 relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider font-mono text-slate-400">
              Ushbu otning to'g'ri artiklini tanlang (der · die · das)
            </div>

            {/* Target German Noun & Uzbek Meaning */}
            <div className="space-y-2 py-4">
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                {isAnswered && (
                  <span
                    className={`mr-3 font-mono ${
                      currentWord.article === 'der'
                        ? 'text-blue-400'
                        : currentWord.article === 'die'
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {currentWord.article}
                  </span>
                )}
                <span>{currentWord.german}</span>
              </div>

              <div className="text-base text-amber-300 font-medium">
                "{currentWord.uzbek}"
              </div>

              {currentWord.plural && (
                <div className="text-xs text-slate-400 font-mono pt-1">
                  Ko'pligi: {currentWord.plural}
                </div>
              )}
            </div>

            {/* 3 Large Article Choice Buttons */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
              {choices.map((c) => {
                const isSelected = selectedArticle === c.art;
                const isCorrect = c.art === currentWord.article;

                let stateClasses = `${c.color} shadow-lg`;
                if (isAnswered) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-500 text-white ring-4 ring-emerald-500/40 font-extrabold';
                  } else if (isSelected) {
                    stateClasses = 'bg-rose-600 text-white ring-4 ring-rose-500/40 opacity-70';
                  } else {
                    stateClasses = 'bg-slate-800 text-slate-500 opacity-40';
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

            {/* Feedback and Continue */}
            {isAnswered && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  {selectedArticle === currentWord.article ? (
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Barakalla! To'g'ri artikl.</span>
                    </div>
                  ) : (
                    <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>Noto'g'ri. To'g'ri artikl: <strong>{currentWord.article}</strong></span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {currentIdx + 1 < deck.length ? 'Keyingisi' : 'Natijalar'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Finish Screen */
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Artikllar jangchisi yakunlandi!</h2>
            <p className="text-xs text-slate-400">
              Siz {deck.length} ta otdan {score} tasining artiklini to'g'ri topdingiz.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {score} / {deck.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">To'g'ri javoblar</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {maxStreak}x
              </div>
              <div className="text-xs text-slate-400 mt-1">Eng uzun streak</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setDeck([...nounWords].sort(() => Math.random() - 0.5));
                setCurrentIdx(0);
                setSelectedArticle(null);
                setIsAnswered(false);
                setScore(0);
                setStreak(0);
                setIsFinished(false);
              }}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span>Qaytadan o'ynash</span>
            </button>

            <button
              onClick={onBackToLesson}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Darsga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
