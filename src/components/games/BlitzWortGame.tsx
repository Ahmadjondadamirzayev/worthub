import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Timer,
  Zap,
  Flame,
  RotateCw,
  Trophy,
  Volume2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { WordItem, CefrLevel } from '../../types/german';
import { speakGerman } from '../../utils/speech';

interface BlitzWortGameProps {
  words: WordItem[];
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
}

interface Question {
  targetWord: WordItem;
  promptText: string;
  options: { text: string; isCorrect: boolean }[];
}

export const BlitzWortGame: React.FC<BlitzWortGameProps> = ({
  words,
  currentLevel,
  onBack,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const getFilteredWords = () => {
    const filtered =
      currentLevel === 'all'
        ? words
        : words.filter((w) => w.level === currentLevel);
    return filtered.length >= 4 ? filtered : words;
  };

  const generateQuestion = (pool: WordItem[]): Question => {
    const targetIdx = Math.floor(Math.random() * pool.length);
    const target = pool[targetIdx];

    // Pick 3 distractors
    const otherWords = pool.filter((w) => w.id !== target.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);

    const deLabel = target.article !== 'none' ? `${target.article} ${target.german}` : target.german;

    const options = [
      { text: target.uzbek, isCorrect: true },
      ...shuffledOthers.map((o) => ({ text: o.uzbek, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);

    return {
      targetWord: target,
      promptText: deLabel,
      options,
    };
  };

  const startGame = () => {
    const pool = getFilteredWords();
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsFinished(false);
    setIsActive(true);
    setFeedback(null);
    setCurrentQuestion(generateQuestion(pool));
  };

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // Audio prompt on new question
  useEffect(() => {
    if (currentQuestion && isActive) {
      speakGerman(currentQuestion.promptText);
    }
  }, [currentQuestion, isActive]);

  const handleSelectOption = (isCorrect: boolean) => {
    if (!isActive || !currentQuestion || feedback) return;

    if (isCorrect) {
      setFeedback('correct');
      const addedPoints = 100 + streak * 20;
      setScore((prev) => prev + addedPoints);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      const pool = getFilteredWords();
      setCurrentQuestion(generateQuestion(pool));
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'yinlar menyusiga</span>
        </button>

        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <Timer className={`w-4 h-4 ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-mono text-sm font-bold ${timeLeft <= 10 ? 'text-rose-400' : 'text-amber-300'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-mono text-orange-400 font-bold">{streak}x</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-mono text-white font-bold">{score} ball</span>
          </div>
        </div>
      </div>

      {/* Game Ready Screen */}
      {!isActive && !isFinished && (
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Blitz-Wort (60 soniya)</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Vaqt poygasi! 60 soniya ichida eng ko'p nemischa so'zlarning o'zbekcha tarjimasini toping.
              To'g'ri ketma-ket javoblar uchun qo'shimcha combo ballari beriladi!
            </p>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 transition-all cursor-pointer"
          >
            Blitz Start (Boshlash)!
          </button>
        </div>
      )}

      {/* Active Question Box */}
      {isActive && currentQuestion && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#101628] border border-slate-800 p-8 text-center relative overflow-hidden shadow-2xl">
            {/* German Flag Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="w-1/3 bg-[#151515]" />
              <div className="w-1/3 bg-[#de0000]" />
              <div className="w-1/3 bg-[#ffce00]" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Nemischa so'z:</span>
              <button
                onClick={() => speakGerman(currentQuestion.promptText)}
                className="p-1 rounded-full text-amber-400 hover:bg-amber-400/10 cursor-pointer"
                title="Talaffuzni tinglash"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              {currentQuestion.promptText}
            </h3>

            {currentQuestion.targetWord.plural && (
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Plural: {currentQuestion.targetWord.plural}
              </p>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(opt.isCorrect)}
                className="p-4 rounded-xl text-left bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-100 font-medium text-sm transition-all cursor-pointer flex items-center justify-between group shadow-md"
              >
                <span>{opt.text}</span>
                <span className="text-xs font-mono text-slate-500 group-hover:text-amber-400">
                  [{i + 1}]
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finished Result Screen */}
      {isFinished && (
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Vaqt tugadi! Blitz yakunlandi</h2>
            <p className="text-xs text-slate-400">
              60 soniyalik shiddatli mashg'ulotda qayd etgan ajoyib natijangiz:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">Umumiy ball</div>
              <div className="text-2xl font-bold text-amber-400 font-mono">{score}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Eng yuqori combo</div>
              <div className="text-2xl font-bold text-orange-400 font-mono">{maxStreak}x</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Qaytadan 60s Blitz</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl cursor-pointer"
            >
              O'yinlar to'plami
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
