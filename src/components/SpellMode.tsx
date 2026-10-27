import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  Award,
} from 'lucide-react';
import { WordItem, VocabularyLesson } from '../types/german';
import { speakGerman } from '../utils/speech';

interface SpellModeProps {
  currentLesson: VocabularyLesson;
  words: WordItem[];
  onBackToLesson: () => void;
}

export const SpellMode: React.FC<SpellModeProps> = ({
  currentLesson,
  words,
  onBackToLesson,
}) => {
  const [deck, setDeck] = useState<WordItem[]>(words);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDeck([...words].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setUserInput('');
    setIsEvaluated(false);
    setIsCorrect(false);
    setShowHint(false);
    setScore(0);
    setIsFinished(false);
  }, [words]);

  const currentWord = deck[currentIdx];

  useEffect(() => {
    if (currentWord && !isFinished) {
      const text =
        currentWord.article !== 'none'
          ? `${currentWord.article} ${currentWord.german}`
          : currentWord.german;
      speakGerman(text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [currentIdx, isFinished]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEvaluated || !currentWord) return;

    const trimmed = userInput.trim().toLowerCase();
    const targetGerman = currentWord.german.toLowerCase();
    const targetWithArticle =
      currentWord.article !== 'none'
        ? `${currentWord.article} ${currentWord.german}`.toLowerCase()
        : targetGerman;

    const correct = trimmed === targetGerman || trimmed === targetWithArticle;
    setIsCorrect(correct);
    setIsEvaluated(true);
    if (correct) {
      setScore((prev) => prev + 1);
    }

    const text =
      currentWord.article !== 'none'
        ? `${currentWord.article} ${currentWord.german}`
        : currentWord.german;
    speakGerman(text);
  };

  const handleInsertChar = (char: string) => {
    setUserInput((prev) => prev + char);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < deck.length) {
      setCurrentIdx((prev) => prev + 1);
      setUserInput('');
      setIsEvaluated(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      setIsFinished(true);
    }
  };

  if (!currentWord || deck.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-slate-400">Ushbu darsda hozircha so'zlar mavjud emas.</p>
        <button
          onClick={onBackToLesson}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs"
        >
          Orqaga
        </button>
      </div>
    );
  }

  const umlauts = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header in Uzbek */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLesson}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentLesson.title} darsiga qaytish</span>
        </button>

        <div className="text-xs font-mono text-slate-400">
          To'g'ri yozilgan: <span className="text-amber-400 font-bold">{score}</span> / {deck.length}
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>So'z: {currentIdx + 1} / {deck.length}</span>
              <span>{Math.round(((currentIdx + 1) / deck.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / deck.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Spell Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Nemischa so'zni to'g'ri yozing:</span>
              <button
                onClick={() => {
                  const text =
                    currentWord.article !== 'none'
                      ? `${currentWord.article} ${currentWord.german}`
                      : currentWord.german;
                  speakGerman(text);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Talaffuzni eshitish"
              >
                <Volume2 className="w-4 h-4" />
                <span>Talaffuz</span>
              </button>
            </div>

            {/* Prompt Definition in Uzbek */}
            <div className="text-center py-2 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                O'zbekcha ma'nosi
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {currentWord.uzbek}
              </h2>
              <div className="text-xs text-slate-400 capitalize">
                {currentWord.partOfSpeech}
                {currentWord.article !== 'none' && (
                  <span> · Artikl: <strong className="text-amber-300">{currentWord.article}</strong></span>
                )}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  disabled={isEvaluated}
                  placeholder={
                    currentWord.article !== 'none'
                      ? `masalan: ${currentWord.article} ...`
                      : 'Nemischa so\'zni kiriting...'
                  }
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full text-center text-lg sm:text-xl font-bold bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                  autoFocus
                />

                {/* Virtual Umlauts keyboard */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 font-mono mr-1">Nemischa harflar:</span>
                  {umlauts.map((char) => (
                    <button
                      key={char}
                      type="button"
                      disabled={isEvaluated}
                      onClick={() => handleInsertChar(char)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer border border-slate-700/60"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {!isEvaluated ? (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Yordamni yashirish' : 'Yordam (bosh harf)'}</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Tekshirish (Enter)
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    {isCorrect ? (
                      <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Barakalla, to'g'ri yozildi!</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>Imlo xatosi mavjud.</span>
                        </div>
                        <div className="text-xs text-slate-300 font-mono">
                          To'g'ri yozilishi: <strong className="text-amber-400">{currentWord.article !== 'none' ? `${currentWord.article} ` : ''}{currentWord.german}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {currentIdx + 1 < deck.length ? 'Keyingisi' : 'Tugatish'}
                  </button>
                </div>
              )}
            </form>

            {/* Hint Display */}
            {showHint && !isEvaluated && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 text-center">
                Birinchi harf:{' '}
                <strong className="text-amber-400 font-mono text-sm">
                  {currentWord.german.charAt(0)}...
                </strong>{' '}
                ({currentWord.german.length} ta harf)
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Completion Screen */
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Yozish mashg'uloti yakunlandi!</h2>
            <p className="text-xs text-slate-400">
              Siz {deck.length} ta so'zdan {score} tasini to'g'ri yozdingiz.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setDeck([...words].sort(() => Math.random() - 0.5));
                setCurrentIdx(0);
                setUserInput('');
                setIsEvaluated(false);
                setIsCorrect(false);
                setShowHint(false);
                setScore(0);
                setIsFinished(false);
              }}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span>Qaytadan yozish</span>
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
