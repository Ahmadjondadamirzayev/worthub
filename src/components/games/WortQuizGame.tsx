import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCw,
  Trophy,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { WordItem, CefrLevel } from '../../types/german';
import { speakGerman } from '../../utils/speech';

interface WortQuizGameProps {
  words: WordItem[];
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
}

interface QuizQuestion {
  word: WordItem;
  direction: 'de_to_uz' | 'uz_to_de';
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export const WortQuizGame: React.FC<WortQuizGameProps> = ({
  words,
  currentLevel,
  onBack,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectList, setIncorrectList] = useState<{ question: QuizQuestion; userAnswer: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const startQuiz = () => {
    const filtered =
      currentLevel === 'all'
        ? words
        : words.filter((w) => w.level === currentLevel);
    const pool = filtered.length >= 4 ? filtered : words;

    // Pick 10 questions
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledPool.slice(0, Math.min(10, shuffledPool.length));

    const generated: QuizQuestion[] = selectedWords.map((w, idx) => {
      const direction: 'de_to_uz' | 'uz_to_de' = idx % 2 === 0 ? 'de_to_uz' : 'uz_to_de';

      const prompt =
        direction === 'de_to_uz'
          ? (w.article !== 'none' ? `${w.article} ${w.german}` : w.german)
          : w.uzbek;

      const correctAnswer =
        direction === 'de_to_uz'
          ? w.uzbek
          : (w.article !== 'none' ? `${w.article} ${w.german}` : w.german);

      // Distractors
      const others = pool.filter((item) => item.id !== w.id);
      const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
      const distractorAnswers = shuffledOthers.map((o) =>
        direction === 'de_to_uz'
          ? o.uzbek
          : (o.article !== 'none' ? `${o.article} ${o.german}` : o.german)
      );

      const options = [correctAnswer, ...distractorAnswers].sort(() => Math.random() - 0.5);

      return {
        word: w,
        direction,
        prompt,
        correctAnswer,
        options,
      };
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIncorrectList([]);
    setIsFinished(false);
  };

  useEffect(() => {
    startQuiz();
  }, [words, currentLevel]);

  const currentQ = questions[currentIdx];

  // Auto pronounce if German prompt
  useEffect(() => {
    if (currentQ && currentQ.direction === 'de_to_uz' && !isFinished) {
      speakGerman(currentQ.prompt);
    }
  }, [currentIdx, currentQ, isFinished]);

  if (questions.length === 0) return null;

  const handleSelectOption = (ans: string) => {
    if (isAnswered) return;
    setSelectedAnswer(ans);
    setIsAnswered(true);

    const isCorrect = ans === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 10);
    } else {
      setIncorrectList((prev) => [...prev, { question: currentQ, userAnswer: ans }]);
    }

    if (currentQ.direction === 'uz_to_de') {
      speakGerman(currentQ.correctAnswer);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'yinlar menyusiga</span>
        </button>

        <div className="flex items-center gap-5 text-xs">
          <div className="text-slate-300">
            Savol: <span className="font-mono text-white font-bold">{currentIdx + 1} / {questions.length}</span>
          </div>
          <div className="text-slate-300">
            To'g'ri: <span className="font-mono text-emerald-400 font-bold">{score / 10}</span>
          </div>
          <div className="text-slate-300">
            Ball: <span className="font-mono text-amber-300 font-bold">{score}</span>
          </div>
        </div>
      </div>

      {!isFinished && currentQ ? (
        <div className="space-y-4">
          {/* Question Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e1424] border border-slate-800 p-8 text-center relative overflow-hidden shadow-2xl">
            {/* German Flag Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="w-1/3 bg-[#151515]" />
              <div className="w-1/3 bg-[#de0000]" />
              <div className="w-1/3 bg-[#ffce00]" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2 text-xs text-slate-400 font-mono">
              <span>{currentQ.direction === 'de_to_uz' ? '🇩🇪 Nemischa -> 🇺🇿 O\'zbekcha' : '🇺🇿 O\'zbekcha -> 🇩🇪 Nemischa'}</span>
              {currentQ.direction === 'de_to_uz' && (
                <button
                  onClick={() => speakGerman(currentQ.prompt)}
                  className="p-1 rounded-full text-amber-400 hover:bg-amber-400/10 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {currentQ.prompt}
            </h2>

            {currentQ.word.exampleSentenceDe && (
              <p className="text-xs text-slate-400 mt-2 italic">
                "{currentQ.word.exampleSentenceDe}"
              </p>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = opt === currentQ.correctAnswer;

              let btnStyle = 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200';
              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-900/50 border-slate-850 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between text-sm ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectOpt && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectOpt && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
              >
                {currentIdx + 1 < questions.length ? "Keyingi savol \u2192" : "Natijani ko'rish"}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Result Summary */
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Wort-Quiz yakunlandi!</h2>
            <p className="text-xs text-slate-400">
              {score >= 80 ? 'Ajoyib natija! So\'zlarni mukammal o\'zlashtiribsiz.' : 'Yaxshi harakat! Xatolarni takrorlab o\'rganing.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">To'plangan ball</div>
              <div className="text-2xl font-bold text-amber-400 font-mono">{score} / {questions.length * 10}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Aniqlik darajasi</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {Math.round((score / (questions.length * 10)) * 100)}%
              </div>
            </div>
          </div>

          {incorrectList.length > 0 && (
            <div className="text-left space-y-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs font-semibold text-rose-300">Takrorlash uchun xatolar:</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {incorrectList.map((item, idx) => (
                  <div key={idx} className="text-xs p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200">{item.question.prompt}</span>
                      <span className="text-slate-500 mx-2">&rarr;</span>
                      <span className="text-emerald-400">{item.question.correctAnswer}</span>
                    </div>
                    <span className="text-[10px] text-rose-400 line-through">{item.userAnswer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={startQuiz}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Yana test topshirish</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl cursor-pointer"
            >
              O'yinlar menyusiga
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
