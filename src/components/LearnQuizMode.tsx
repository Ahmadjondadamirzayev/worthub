import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Volume2,
  RotateCw,
  Award,
} from 'lucide-react';
import { WordItem, VocabularyLesson } from '../types/german';
import { speakGerman } from '../utils/speech';

interface LearnQuizModeProps {
  currentLesson: VocabularyLesson;
  words: WordItem[];
  allWords: WordItem[];
  onBackToLesson: () => void;
}

interface Question {
  word: WordItem;
  type: 'de_to_uz' | 'uz_to_de';
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export const LearnQuizMode: React.FC<LearnQuizModeProps> = ({
  currentLesson,
  words,
  allWords,
  onBackToLesson,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;

    const pool = allWords.length >= 4 ? allWords : words;

    const generated: Question[] = words.map((w, index) => {
      const isDeToUz = index % 2 === 0;

      if (isDeToUz) {
        // German term -> Uzbek translation
        const prompt =
          w.article !== 'none' ? `${w.article} ${w.german}` : w.german;
        const correctAnswer = w.uzbek;

        const otherWords = pool.filter((item) => item.id !== w.id);
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        const distractors = shuffledOthers.slice(0, 3).map((item) => item.uzbek);
        const options = [...distractors, correctAnswer].sort(
          () => Math.random() - 0.5
        );

        return {
          word: w,
          type: 'de_to_uz',
          prompt,
          correctAnswer,
          options,
        };
      } else {
        // Uzbek meaning -> German term with correct article
        const prompt = w.uzbek;
        const correctAnswer =
          w.article !== 'none' ? `${w.article} ${w.german}` : w.german;

        const otherWords = pool.filter((item) => item.id !== w.id);
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        const distractors = shuffledOthers.slice(0, 3).map((item) =>
          item.article !== 'none' ? `${item.article} ${item.german}` : item.german
        );
        const options = [...distractors, correctAnswer].sort(
          () => Math.random() - 0.5
        );

        return {
          word: w,
          type: 'uz_to_de',
          prompt,
          correctAnswer,
          options,
        };
      }
    });

    setQuestions(generated.sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  }, [words, allWords]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const germanText =
      currentQ.word.article !== 'none'
        ? `${currentQ.word.article} ${currentQ.word.german}`
        : currentQ.word.german;
    speakGerman(germanText);
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (!currentQ || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-slate-400">Viktorina uchun kamida 2 ta so'z zarur.</p>
        <button
          onClick={onBackToLesson}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs"
        >
          Darsga qaytish
        </button>
      </div>
    );
  }

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

        <div className="text-xs font-mono text-slate-400">
          To'g'ri javoblar: <span className="text-amber-400 font-bold">{score}</span> / {questions.length}
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Savol: {currentIdx + 1} / {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">
                {currentQ.type === 'de_to_uz'
                  ? 'To\'g\'ri o\'zbekcha tarjimani tanlang:'
                  : 'Nemischa to\'g\'ri so\'z va artiklni tanlang:'}
              </span>
              <button
                onClick={() => {
                  const germanText =
                    currentQ.word.article !== 'none'
                      ? `${currentQ.word.article} ${currentQ.word.german}`
                      : currentQ.word.german;
                  speakGerman(germanText);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                title="Talaffuzni eshitish"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-4">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                {currentQ.prompt}
              </h2>
              {currentQ.word.exampleSentenceDe && currentQ.type === 'de_to_uz' && (
                <p className="text-xs text-slate-400 italic mt-3 max-w-md mx-auto">
                  "{currentQ.word.exampleSentenceDe}"
                </p>
              )}
            </div>

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;

                let btnStyle = 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500/50 bg-rose-500/20 text-rose-300 font-bold';
                  } else {
                    btnStyle = 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next Button */}
            {isAnswered && (
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  {selectedOption === currentQ.correctAnswer ? (
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>To'g'ri! Ajoyib natija.</span>
                    </div>
                  ) : (
                    <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>Xato. To'g'ri javob: {currentQ.correctAnswer}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {currentIdx + 1 < questions.length ? 'Keyingi savol' : 'Natijalarni ko\'rish'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Screen */
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Viktorina yakunlandi!</h2>
            <p className="text-xs text-slate-400">
              Siz {questions.length} ta savoldan {score} tasiga to'g'ri javob berdingiz (
              {Math.round((score / questions.length) * 100)}%).
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setCurrentIdx(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setScore(0);
                setIsFinished(false);
              }}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span>Qaytadan ishlash</span>
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
