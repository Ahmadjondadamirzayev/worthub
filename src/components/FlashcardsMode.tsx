import React, { useState, useEffect } from 'react';
import {
  Volume2,
  RotateCw,
  Shuffle,
  Star,
  Check,
  X,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { WordItem, VocabularyLesson } from '../types/german';
import { ARTICLE_COLORS } from '../utils/germanGrammar';
import { speakGerman } from '../utils/speech';

interface FlashcardsModeProps {
  currentLesson: VocabularyLesson;
  words: WordItem[];
  onBackToLesson: () => void;
  onToggleStar: (wordId: string) => void;
}

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({
  currentLesson,
  words,
  onBackToLesson,
  onToggleStar,
}) => {
  const [deck, setDeck] = useState<WordItem[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [stillLearningIds, setStillLearningIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearnedCount(0);
    setStillLearningIds([]);
    setIsFinished(false);
  }, [words]);

  const currentCard = deck[currentIndex];

  useEffect(() => {
    if (currentCard && autoSpeak && !isFinished) {
      const text =
        currentCard.article !== 'none'
          ? `${currentCard.article} ${currentCard.german}`
          : currentCard.german;
      speakGerman(text);
    }
  }, [currentIndex, isFinished]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleMarkStillLearning();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleMarkLearned();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, isFinished, deck]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    const text =
      currentCard.article !== 'none'
        ? `${currentCard.article} ${currentCard.german}`
        : currentCard.german;
    speakGerman(text);
  };

  const advanceCard = () => {
    setIsFlipped(false);
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleMarkLearned = () => {
    setLearnedCount((prev) => prev + 1);
    advanceCard();
  };

  const handleMarkStillLearning = () => {
    if (currentCard) {
      setStillLearningIds((prev) => [...prev, currentCard.id]);
    }
    advanceCard();
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearnedCount(0);
    setStillLearningIds([]);
    setIsFinished(false);
  };

  const handleRestartAll = () => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearnedCount(0);
    setStillLearningIds([]);
    setIsFinished(false);
  };

  const handleRestartUnlearned = () => {
    const remaining = words.filter((w) => stillLearningIds.includes(w.id));
    if (remaining.length === 0) {
      handleRestartAll();
      return;
    }
    setDeck(remaining);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearnedCount(0);
    setStillLearningIds([]);
    setIsFinished(false);
  };

  if (!currentCard || deck.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-slate-400">Ushbu darsda hozircha so'zlar mavjud emas.</p>
        <button
          onClick={onBackToLesson}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs"
        >
          Darsga qaytish
        </button>
      </div>
    );
  }

  const artColor = ARTICLE_COLORS[currentCard.article];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLesson}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentLesson.title} darsiga qaytish</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            title={autoSpeak ? 'Avto-talaffuz: YONIQ' : 'Avto-talaffuz: O\'CHIQ'}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              autoSpeak
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Avto-talaffuz</span>
          </button>

          <button
            onClick={handleShuffle}
            title="Kartalarni aralashtirish"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aralashtirish</span>
          </button>
        </div>
      </div>

      {!isFinished ? (
        <>
          {/* Progress bar in Uzbek */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>
                Karta: {currentIndex + 1} / {deck.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-semibold">O'rganildi: {learnedCount}</span>
                <span className="text-amber-400 font-semibold">Takrorlash: {stillLearningIds.length}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 3D Flashcard Container */}
          <div
            onClick={handleFlip}
            className="w-full h-80 sm:h-96 relative cursor-pointer select-none group perspective-1000"
          >
            <div
              className={`w-full h-full duration-500 rounded-2xl border transition-all preserve-3d shadow-2xl relative ${
                isFlipped ? 'rotate-y-180' : ''
              } ${
                currentCard.article !== 'none'
                  ? currentCard.article === 'der'
                    ? 'border-blue-500/40 bg-gradient-to-b from-[#0f172a] to-[#0a1122]'
                    : currentCard.article === 'die'
                    ? 'border-rose-500/40 bg-gradient-to-b from-[#0f172a] to-[#1f0a14]'
                    : 'border-emerald-500/40 bg-gradient-to-b from-[#0f172a] to-[#081b14]'
                  : 'border-slate-800 bg-[#0f172a]'
              }`}
            >
              {/* FRONT: German Word & Article */}
              <div className="absolute inset-0 backface-hidden p-8 flex flex-col justify-between rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentCard.article !== 'none' && (
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${artColor.bg} ${artColor.text} ${artColor.border}`}
                      >
                        {currentCard.article}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {artColor.labelUz.split('·')[0].trim()}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      · {currentCard.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSpeak}
                      className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Nemischa talaffuzni eshitish"
                    >
                      <Volume2 className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(currentCard.id);
                      }}
                      className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Muhim so'z sifatida belgilash"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          currentCard.isStarred
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Center: German Term */}
                <div className="text-center my-auto space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                    {currentCard.article !== 'none' && (
                      <span className={`${artColor.text} mr-2 font-mono font-semibold`}>
                        {currentCard.article}
                      </span>
                    )}
                    <span>{currentCard.german}</span>
                  </div>

                  {currentCard.plural && (
                    <div className="text-sm font-mono text-slate-400">
                      Ko'plik shakli: <span className="text-amber-300 font-semibold">{currentCard.plural}</span>
                    </div>
                  )}

                  {currentCard.exampleSentenceDe && (
                    <div className="text-xs text-slate-300 italic max-w-lg mx-auto pt-4 border-t border-slate-800/60">
                      "{currentCard.exampleSentenceDe}"
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-slate-500 font-mono">
                  O'zbekcha tarjimani ko'rish uchun bosing yoki Bo'shliq (Space) tugmasini bosing
                </div>
              </div>

              {/* BACK: Uzbek Translation */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 flex flex-col justify-between rounded-2xl bg-[#0d1424] border border-amber-500/40">
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                  <span>O'zbekcha ma'nosi</span>
                  <span className="capitalize">{currentCard.partOfSpeech}</span>
                </div>

                <div className="text-center my-auto space-y-3">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-300">
                    {currentCard.uzbek}
                  </div>

                  {currentCard.notes && (
                    <div className="text-xs text-slate-300 max-w-md mx-auto">
                      💡 {currentCard.notes}
                    </div>
                  )}

                  {currentCard.exampleSentenceUz && (
                    <div className="text-xs text-slate-400 italic max-w-lg mx-auto pt-3 border-t border-slate-800">
                      "{currentCard.exampleSentenceUz}"
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-slate-500 font-mono">
                  Kartani qaytarish uchun bosing
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons in Uzbek */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handleMarkStillLearning}
              className="flex-1 max-w-[210px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <RotateCw className="w-4 h-4" />
              <span>Yana takrorlash (←)</span>
            </button>

            <button
              onClick={handleFlip}
              className="p-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Kartani ag'darish (Space)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleMarkLearned}
              className="flex-1 max-w-[210px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>O'rganildi (→)</span>
            </button>
          </div>
        </>
      ) : (
        /* Finished screen in Uzbek */
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Barakalla!</h2>
            <p className="text-xs text-slate-400">
              Siz ushbu darsdagi barcha {deck.length} ta so'zni muvaffaqiyatli ko'rib chiqdingiz.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {learnedCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">O'zlashtirildi</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {stillLearningIds.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Takrorlash kerak</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {stillLearningIds.length > 0 && (
              <button
                onClick={handleRestartUnlearned}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                Qiyin bo'lgan {stillLearningIds.length} ta so'zni mashq qilish
              </button>
            )}

            <button
              onClick={handleRestartAll}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Boshidan takrorlash
            </button>

            <button
              onClick={onBackToLesson}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Darsga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
