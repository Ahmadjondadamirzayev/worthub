import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  RotateCw,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Delete,
  Sparkles,
} from 'lucide-react';
import { WordItem, CefrLevel } from '../../types/german';
import { speakGerman } from '../../utils/speech';

interface BuchstabensalatGameProps {
  words: WordItem[];
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
}

interface LetterTile {
  id: number;
  char: string;
  isUsed: boolean;
}

export const BuchstabensalatGame: React.FC<BuchstabensalatGameProps> = ({
  words,
  currentLevel,
  onBack,
}) => {
  const [deck, setDeck] = useState<WordItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tiles, setTiles] = useState<LetterTile[]>([]);
  const [selectedLetterIds, setSelectedLetterIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const filtered =
      currentLevel === 'all'
        ? words
        : words.filter((w) => w.level === currentLevel);
    const pool = filtered.length >= 3 ? filtered : words;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    setDeck(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
  }, [words, currentLevel]);

  const currentWord = deck[currentIdx];

  // Setup current word scrambled tiles
  useEffect(() => {
    if (!currentWord) return;
    setShowHint(false);
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedLetterIds([]);

    const chars = currentWord.german.split('');
    const randomized = chars
      .map((c, i) => ({ id: i, char: c, isUsed: false }))
      .sort(() => Math.random() - 0.5);

    setTiles(randomized);
  }, [currentIdx, currentWord]);

  if (!currentWord) return null;

  const currentConstructedWord = selectedLetterIds
    .map((id) => tiles.find((t) => t.id === id)?.char || '')
    .join('');

  const handleTileClick = (id: number) => {
    if (isAnswered) return;
    if (selectedLetterIds.includes(id)) {
      // Remove from selected
      setSelectedLetterIds((prev) => prev.filter((i) => i !== id));
      setTiles((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isUsed: false } : t))
      );
    } else {
      // Add to selected
      setSelectedLetterIds((prev) => [...prev, id]);
      setTiles((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isUsed: true } : t))
      );
    }
  };

  const handleBackspace = () => {
    if (isAnswered || selectedLetterIds.length === 0) return;
    const lastId = selectedLetterIds[selectedLetterIds.length - 1];
    setSelectedLetterIds((prev) => prev.slice(0, -1));
    setTiles((prev) =>
      prev.map((t) => (t.id === lastId ? { ...t, isUsed: false } : t))
    );
  };

  const handleResetLetters = () => {
    if (isAnswered) return;
    setSelectedLetterIds([]);
    setTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })));
  };

  const handleCheckAnswer = () => {
    if (isAnswered) return;
    const correct = currentConstructedWord === currentWord.german;
    setIsAnswered(true);
    setIsCorrect(correct);

    speakGerman(currentWord.german);

    if (correct) {
      setScore((prev) => prev + (showHint ? 50 : 100) + streak * 10);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextWord = () => {
    if (currentIdx + 1 < deck.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Restart shuffled
      setCurrentIdx(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
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
            So'z: <span className="font-mono text-white font-bold">{currentIdx + 1} / {deck.length}</span>
          </div>
          <div className="text-slate-300">
            Ketma-ket: <span className="font-mono text-orange-400 font-bold">{streak}x</span>
          </div>
          <div className="text-slate-300">
            Ball: <span className="font-mono text-amber-300 font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e1320] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* German Flag Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-[#151515]" />
          <div className="w-1/3 bg-[#de0000]" />
          <div className="w-1/3 bg-[#ffce00]" />
        </div>

        {/* Translation Prompt */}
        <div className="text-center space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            O'zbekcha ma'nosi:
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {currentWord.uzbek}
          </h2>
          {currentWord.article !== 'none' && (
            <div className="inline-block px-2.5 py-0.5 rounded bg-slate-800 text-[11px] text-amber-300 font-mono mt-1 border border-slate-700">
              Artikl: <strong>{currentWord.article}</strong>
            </div>
          )}
        </div>

        {/* Constructed Word Display */}
        <div className="flex items-center justify-center gap-2 min-h-[64px] p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          {currentConstructedWord.length === 0 ? (
            <span className="text-xs text-slate-500 font-mono italic">
              Harflarni ketma-ket bosing...
            </span>
          ) : (
            <div className="flex flex-wrap justify-center gap-1.5">
              {selectedLetterIds.map((id) => {
                const tile = tiles.find((t) => t.id === id);
                return (
                  <button
                    key={id}
                    onClick={() => handleTileClick(id)}
                    disabled={isAnswered}
                    className="w-10 h-11 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold text-lg flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer"
                  >
                    {tile?.char}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrambled Available Letters */}
        <div className="space-y-3">
          <div className="text-xs text-slate-400 text-center font-medium">
            Aralash harflar (Buchstabensalat):
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {tiles.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTileClick(t.id)}
                disabled={t.isUsed || isAnswered}
                className={`w-11 h-12 rounded-xl text-lg font-bold transition-all cursor-pointer flex items-center justify-center border ${
                  t.isUsed
                    ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-30'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-amber-400 text-white shadow-md active:scale-95'
                }`}
              >
                {t.char}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackspace}
              disabled={isAnswered || selectedLetterIds.length === 0}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Oxirgi harfni o'chirish"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetLetters}
              disabled={isAnswered || selectedLetterIds.length === 0}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer text-xs"
            >
              Tozalash
            </button>
            <button
              onClick={() => setShowHint(true)}
              className="px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-amber-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Yordam</span>
            </button>
          </div>

          {!isAnswered ? (
            <button
              onClick={handleCheckAnswer}
              disabled={currentConstructedWord.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              Tekshirish
            </button>
          ) : (
            <button
              onClick={handleNextWord}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>Keyingi so'z</span>
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hint Box */}
        {showHint && !isAnswered && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            Maslahat: So'z <strong>{currentWord.german.slice(0, 2)}...</strong> harflari bilan boshlanadi.
          </div>
        )}

        {/* Feedback Result */}
        {isAnswered && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {isCorrect ? 'Barakalla, to\'g\'ri yozdingiz!' : 'Xato terildi! To\'g\'ri yozilishi:'}
                </div>
                <div className="text-xs font-mono text-slate-300">
                  {currentWord.article !== 'none' && `${currentWord.article} `}
                  <strong>{currentWord.german}</strong>
                  {currentWord.plural && ` (Pl: ${currentWord.plural})`}
                </div>
              </div>
            </div>

            <button
              onClick={() => speakGerman(currentWord.german)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
