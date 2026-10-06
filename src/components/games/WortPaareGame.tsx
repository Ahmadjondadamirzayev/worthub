import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCw,
  Trophy,
  Timer,
  CheckCircle2,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { WordItem, CefrLevel } from '../../types/german';
import { speakGerman } from '../../utils/speech';

interface WortPaareGameProps {
  words: WordItem[];
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
}

interface CardItem {
  id: string; // unique card id
  pairId: string; // word id
  text: string;
  subtext?: string;
  lang: 'de' | 'uz';
  isFlipped: boolean;
  isMatched: boolean;
}

export const WortPaareGame: React.FC<WortPaareGameProps> = ({
  words,
  currentLevel,
  onBack,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize cards
  const startNewGame = () => {
    const filtered =
      currentLevel === 'all'
        ? words
        : words.filter((w) => w.level === currentLevel);
    const sourceWords = filtered.length >= 6 ? filtered : words;

    // Pick 6 random words (making 12 cards)
    const shuffledWords = [...sourceWords].sort(() => Math.random() - 0.5).slice(0, 6);

    const generatedCards: CardItem[] = [];
    shuffledWords.forEach((w) => {
      // German Card
      const deLabel = w.article !== 'none' ? `${w.article} ${w.german}` : w.german;
      generatedCards.push({
        id: `de-${w.id}`,
        pairId: w.id,
        text: deLabel,
        subtext: w.plural ? `Pl: ${w.plural}` : undefined,
        lang: 'de',
        isFlipped: false,
        isMatched: false,
      });
      // Uzbek Card
      generatedCards.push({
        id: `uz-${w.id}`,
        pairId: w.id,
        text: w.uzbek,
        lang: 'uz',
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle the cards
    const shuffledCards = generatedCards.sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setSelectedCards([]);
    setMatchedCount(0);
    setMoves(0);
    setSeconds(0);
    setIsRunning(true);
    setIsCompleted(false);
  };

  useEffect(() => {
    startNewGame();
  }, [words, currentLevel]);

  // Timer
  useEffect(() => {
    let interval: any;
    if (isRunning && !isCompleted) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isCompleted]);

  const handleCardClick = (index: number) => {
    if (!isRunning || isCompleted) return;
    if (cards[index].isMatched || cards[index].isFlipped) return;
    if (selectedCards.length === 2) return;

    // Speak German if german card
    if (cards[index].lang === 'de') {
      speakGerman(cards[index].text);
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            )
          );
          setSelectedCards([]);
          setMatchedCount((prev) => {
            const updated = prev + 1;
            if (updated === 6) {
              setIsCompleted(true);
              setIsRunning(false);
            }
            return updated;
          });
        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'yinlar menyusiga qaytish</span>
        </button>

        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-amber-300 font-bold">{formatTime(seconds)}</span>
          </div>
          <div className="text-slate-300">
            Urinishlar: <span className="font-mono text-white font-bold">{moves}</span>
          </div>
          <div className="text-slate-300">
            Topildi: <span className="font-mono text-emerald-400 font-bold">{matchedCount} / 6</span>
          </div>
          <button
            onClick={startNewGame}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer text-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Qayta boshlash</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {!isCompleted ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, idx) => {
            const isSelected = selectedCards.includes(idx);
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(idx)}
                disabled={card.isMatched || isSelected}
                className={`h-28 sm:h-32 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-300 relative select-none cursor-pointer border ${
                  card.isMatched
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 opacity-60 scale-95 shadow-inner'
                    : isRevealed
                    ? card.lang === 'de'
                      ? 'bg-gradient-to-br from-slate-900 to-amber-950/30 border-amber-500/60 text-amber-200 shadow-lg shadow-amber-500/10'
                      : 'bg-gradient-to-br from-slate-900 to-sky-950/30 border-sky-500/60 text-sky-200 shadow-lg shadow-sky-500/10'
                    : 'bg-gradient-to-br from-slate-900/90 to-slate-800/80 hover:from-slate-800 hover:to-slate-700/80 border-slate-700/70 hover:border-slate-500 text-slate-400 hover:text-slate-200 shadow-md'
                }`}
              >
                {/* Top ribbon flag accent on unrevealed cards */}
                {!isRevealed && (
                  <div className="absolute top-2 w-8 h-1 rounded-full bg-slate-700/60" />
                )}

                {isRevealed ? (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-60 block">
                      {card.lang === 'de' ? '🇩🇪 Deutsch' : "🇺🇿 O'zbekcha"}
                    </span>
                    <div className="font-semibold text-sm sm:text-base leading-snug">
                      {card.text}
                    </div>
                    {card.subtext && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {card.subtext}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-70">
                    <Sparkles className="w-5 h-5 text-amber-400/60" />
                    <span className="text-[11px] font-mono text-slate-400">Worthub</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Victory Screen */
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0f1422] to-slate-900 border border-slate-800 p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Ajoyib natija! Barcha juftliklar topildi!</h2>
            <p className="text-sm text-slate-400">
              Siz nemischa va o'zbekcha so'z juftliklarini muvaffaqiyatli xotirangizda mustahkamlab oldingiz.
            </p>
          </div>

          <div className="grid grid-cols-2 max-w-xs mx-auto gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="text-[11px] text-slate-400">Sarflangan vaqt</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{formatTime(seconds)}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Urinishlar</div>
              <div className="text-lg font-bold text-sky-400 font-mono">{moves} ta</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={startNewGame}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-red-600/20 cursor-pointer"
            >
              Yana bir bor o'ynash
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
