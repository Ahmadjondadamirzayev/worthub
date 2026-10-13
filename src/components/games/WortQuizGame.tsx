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
  theme?: 'dark' | 'light';
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
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
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
      <div className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
      }`}>
        <button
          onClick={onBack}
          className={`flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'yinlar menyusiga</span>
        </button>

        <div className="flex items-center gap-5 text-xs">
          <div>
            Savol: <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentIdx + 1} / {questions.length}</span>
          </div>
          <div>
            To'g'ri: <span className="font-mono text-emerald-500 font-bold">{score / 10}</span>
          </div>
          <div>
            Ball: <span className="font-mono text-amber-500 font-bold">{score}</span>
          </div>
        </div>
      </div>

      {!isFinished && currentQ ? (
        <div className="space-y-4">
          {/* Question Card */}
          <div className={`rounded-2xl border p-8 text-center relative overflow-hidden shadow-2xl transition-colors ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 to-[#0e1424] border-slate-800 text-white'
              : 'bg-white border-slate-200 shadow-xl text-slate-900'
          }`}>
            {/* German Flag Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="w-1/3 bg-[#151515]" />
              <div className="w-1/3 bg-[#de0000]" />
              <div className="w-1/3 bg-[#ffce00]" />
            </div>

            <div className={`flex items-center justify-center gap-2 mb-2 text-xs font-mono ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span>{currentQ.direction === 'de_to_uz' ? '🇩🇪 Nemischa -> 🇺🇿 O\'zbekcha' : '🇺🇿 O\'zbekcha -> 🇩🇪 Nemischa'}</span>
              {currentQ.direction === 'de_to_uz' && (
                <button
                  onClick={() => speakGerman(currentQ.prompt)}
                  className="p-1 rounded-full text-amber-500 hover:bg-amber-400/10 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentQ.prompt}
            </h2>

            {currentQ.word.exampleSentenceDe && (
              <p className={`text-xs mt-2 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                "{currentQ.word.exampleSentenceDe}"
              </p>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = opt === currentQ.correctAnswer;

              let btnStyle = isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs';

              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-500 font-semibold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-500';
                } else {
                  btnStyle = isDark ? 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60' : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectOpt && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
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
        <div className={`rounded-2xl border p-8 text-center space-y-6 ${
          isDark ? 'bg-[#0f1422] border-slate-800 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900'
        }`}>
          <div className="inline-flex p-4 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Wort-Quiz yakunlandi!</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {score >= 80 ? 'Ajoyib natija! So\'zlarni mukammal o\'zlashtiribsiz.' : 'Yaxshi harakat! Xatolarni takrorlab o\'rganing.'}
            </p>
          </div>

          <div className={`grid grid-cols-2 gap-4 max-w-xs mx-auto p-4 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>To'plangan ball</div>
              <div className="text-2xl font-bold text-amber-500 font-mono">{score} / {questions.length * 10}</div>
            </div>
            <div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Aniqlik darajasi</div>
              <div className="text-2xl font-bold text-emerald-500 font-mono">
                {Math.round((score / (questions.length * 10)) * 100)}%
              </div>
            </div>
          </div>

          {incorrectList.length > 0 && (
            <div className={`text-left space-y-2 p-4 rounded-xl border ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs font-semibold text-rose-500">Takrorlash uchun xatolar:</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {incorrectList.map((item, idx) => (
                  <div key={idx} className={`text-xs p-2 rounded border flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.question.prompt}</span>
                      <span className="text-slate-500 mx-2">&rarr;</span>
                      <span className="text-emerald-500 font-medium">{item.question.correctAnswer}</span>
                    </div>
                    <span className="text-[10px] text-rose-500 line-through">{item.userAnswer}</span>
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
              className={`px-5 py-2.5 text-xs rounded-xl cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              O'yinlar menyusiga
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
