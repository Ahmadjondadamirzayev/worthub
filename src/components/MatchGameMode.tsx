import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Timer,
  RotateCw,
  Trophy,
} from 'lucide-react';
import { WordItem, VocabularyLesson } from '../types/german';
import { speakGerman } from '../utils/speech';

interface MatchGameModeProps {
  currentLesson: VocabularyLesson;
  words: WordItem[];
  onBackToLesson: () => void;
}

interface Tile {
  id: string;
  wordId: string;
  text: string;
  type: 'de' | 'uz';
  isMatched: boolean;
}

export const MatchGameMode: React.FC<MatchGameModeProps> = ({
  currentLesson,
  words,
  onBackToLesson,
}) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [wrongTileId, setWrongTileId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const initGame = () => {
    const sampleWords = [...words].sort(() => Math.random() - 0.5).slice(0, 6);

    const generated: Tile[] = [];
    sampleWords.forEach((w) => {
      const germanText =
        w.article !== 'none' ? `${w.article} ${w.german}` : w.german;

      generated.push({
        id: `de-${w.id}`,
        wordId: w.id,
        text: germanText,
        type: 'de',
        isMatched: false,
      });

      generated.push({
        id: `uz-${w.id}`,
        wordId: w.id,
        text: w.uzbek,
        type: 'uz',
        isMatched: false,
      });
    });

    setTiles(generated.sort(() => Math.random() - 0.5));
    setSelectedTile(null);
    setWrongTileId(null);
    setTimerSeconds(0);
    setIsRunning(true);
    setIsCompleted(false);
  };

  useEffect(() => {
    initGame();
  }, [words]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 0.1);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isCompleted]);

  const handleTileClick = (tile: Tile) => {
    if (tile.isMatched || isCompleted) return;

    if (!selectedTile) {
      setSelectedTile(tile);
      if (tile.type === 'de') {
        speakGerman(tile.text);
      }
      return;
    }

    if (selectedTile.id === tile.id) {
      setSelectedTile(null);
      return;
    }

    if (selectedTile.wordId === tile.wordId && selectedTile.type !== tile.type) {
      // Match found
      setTiles((prev) =>
        prev.map((t) =>
          t.wordId === tile.wordId ? { ...t, isMatched: true } : t
        )
      );
      setSelectedTile(null);

      const remainingUnmatched = tiles.filter(
        (t) => t.wordId !== tile.wordId && !t.isMatched
      );
      if (remainingUnmatched.length === 0) {
        setIsCompleted(true);
        setIsRunning(false);
        const finalTime = timerSeconds + 0.1;
        if (!bestTime || finalTime < bestTime) {
          setBestTime(finalTime);
        }
      }
    } else {
      setWrongTileId(tile.id);
      setTimeout(() => {
        setSelectedTile(null);
        setWrongTileId(null);
      }, 500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header in Uzbek */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLesson}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentLesson.title} darsiga qaytish</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Timer className="w-4 h-4" />
            <span>{timerSeconds.toFixed(1)}s</span>
          </div>

          {bestTime && (
            <div className="text-slate-400">
              Eng yaxshi rekord: <span className="text-emerald-400 font-bold">{bestTime.toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>

      {!isCompleted ? (
        <div className="space-y-4">
          <div className="text-center text-xs text-slate-400">
            Nemischa so'z va uning o'zbekcha tarjimasini imkon qadar tezroq bir-biriga moslashtiring!
          </div>

          {/* Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 rounded-2xl border border-slate-800 bg-[#0f172a]/80 shadow-2xl">
            {tiles.map((tile) => {
              if (tile.isMatched) {
                return (
                  <div
                    key={tile.id}
                    className="h-24 sm:h-28 rounded-xl border border-emerald-500/20 bg-emerald-500/5 opacity-20 pointer-events-none"
                  />
                );
              }

              const isSelected = selectedTile?.id === tile.id;
              const isWrong = wrongTileId === tile.id;

              let tileClass = 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700 hover:bg-slate-800/90';
              if (isSelected) {
                tileClass = 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/30 font-semibold';
              } else if (isWrong) {
                tileClass = 'border-rose-500 bg-rose-500/20 text-rose-300 animate-shake font-semibold';
              }

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  className={`h-24 sm:h-28 p-3 rounded-xl border transition-all text-center flex items-center justify-center cursor-pointer text-xs sm:text-sm font-medium ${tileClass}`}
                >
                  <span className="line-clamp-3">{tile.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Victory Screen in Uzbek */
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Barcha juftliklar topildi!</h2>
            <p className="text-sm text-slate-300 font-mono">
              Sarflangan vaqt: <strong className="text-amber-400 text-lg">{timerSeconds.toFixed(1)} soniya</strong>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={initGame}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span>Qaytadan o'ynash</span>
            </button>

            <button
              onClick={onBackToLesson}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Darsga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
