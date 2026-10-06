import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCw,
  Trophy,
  Volume2,
  Sparkles,
  HelpCircle,
  Delete,
} from 'lucide-react';
import { CefrLevel } from '../../types/german';
import { speakGerman } from '../../utils/speech';

interface SatzbauProfiGameProps {
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
}

interface SentencePuzzle {
  id: string;
  correctWords: string[];
  translationUz: string;
  grammarNote: string;
  level: CefrLevel;
}

const SENTENCES_DATABASE: SentencePuzzle[] = [
  {
    id: 's-1',
    correctWords: ['Ich', 'lerne', 'jeden', 'Tag', 'fleißig', 'Deutsch.'],
    translationUz: 'Men har kuni qunt bilan nemis tilini o\'rganaman.',
    grammarNote: 'Asosiy qoida: Nemis tilida darak gapda tuslangan fe\'l (lerne) har doim 2-o\'rinda turadi (Verb auf Position 2).',
    level: 'A1',
  },
  {
    id: 's-2',
    correctWords: ['Heute', 'fahre', 'ich', 'mit', 'dem', 'Zug', 'nach', 'Berlin.'],
    translationUz: 'Bugun men poyezd bilan Berlinga ketyapman.',
    grammarNote: 'Inversiya qoidasi: Gap vaqt bilan (Heute) boshlansa, fe\'l (fahre) yana 2-o\'rinda, ega (ich) esa 3-o\'rinda keladi.',
    level: 'A1',
  },
  {
    id: 's-3',
    correctWords: ['Wir', 'haben', 'gestern', 'einen', 'interessanten', 'Film', 'gesehen.'],
    translationUz: 'Biz kecha qiziqarli film ko\'rdik.',
    grammarNote: 'Perfekt zamoni qoidasi: Yordamchi fe\'l (haben) 2-o\'rinda, asosiy sifatdosh fe\'l (gesehen) gapning eng oxirida turadi.',
    level: 'A2',
  },
  {
    id: 's-4',
    correctWords: ['Weil', 'es', 'stark', 'regnet,', 'bleibe', 'ich', 'zu', 'Hause.'],
    translationUz: 'Kuchli yomg\'ir yog\'ayotgani sababli, men uyda qolaman.',
    grammarNote: 'Ergash gap (Nebensatz): "Weil" bog\'lovchisidan keyin fe\'l (regnet) gap oxiriga ketadi, bosh gap esa fe\'l (bleibe) bilan boshlanadi.',
    level: 'B1',
  },
  {
    id: 's-5',
    correctWords: ['Ich', 'weiß,', 'dass', 'Deutsch', 'eine', 'wichtige', 'Sprache', 'ist.'],
    translationUz: 'Men nemis tili muhim til ekanligini bilaman.',
    grammarNote: '"Dass" bog\'lovchisi bo\'lgan ergash gapda tuslangan fe\'l (ist) gapning oxiriga suriladi.',
    level: 'B1',
  },
  {
    id: 's-6',
    correctWords: ['Obwohl', 'er', 'müde', 'war,', 'arbeitete', 'er', 'bis', 'spät.'],
    translationUz: 'U charchagan bo\'lishiga qaramasdan, kechgacha ishladi.',
    grammarNote: '"Obwohl" to\'siqsiz ergash gap bog\'lovchisi fe\'lni (war) ergash gap oxiriga qo\'yadi.',
    level: 'B2',
  },
];

export const SatzbauProfiGame: React.FC<SatzbauProfiGameProps> = ({
  currentLevel,
  onBack,
}) => {
  const filtered =
    currentLevel === 'all'
      ? SENTENCES_DATABASE
      : SENTENCES_DATABASE.filter((s) => s.level === currentLevel);
  const sentences = filtered.length > 0 ? filtered : SENTENCES_DATABASE;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [availableTiles, setAvailableTiles] = useState<{ id: number; text: string; isUsed: boolean }[]>([]);
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentSentence = sentences[currentIdx];

  useEffect(() => {
    if (!currentSentence) return;
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedWordIds([]);

    const shuffled = currentSentence.correctWords
      .map((w, idx) => ({ id: idx, text: w, isUsed: false }))
      .sort(() => Math.random() - 0.5);

    setAvailableTiles(shuffled);
  }, [currentIdx, currentSentence]);

  if (!currentSentence) return null;

  const constructedSentence = selectedWordIds
    .map((id) => availableTiles.find((t) => t.id === id)?.text || '')
    .join(' ');

  const handleTileClick = (id: number) => {
    if (isAnswered) return;
    if (selectedWordIds.includes(id)) {
      setSelectedWordIds((prev) => prev.filter((i) => i !== id));
      setAvailableTiles((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isUsed: false } : t))
      );
    } else {
      setSelectedWordIds((prev) => [...prev, id]);
      setAvailableTiles((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isUsed: true } : t))
      );
    }
  };

  const handleBackspace = () => {
    if (isAnswered || selectedWordIds.length === 0) return;
    const lastId = selectedWordIds[selectedWordIds.length - 1];
    setSelectedWordIds((prev) => prev.slice(0, -1));
    setAvailableTiles((prev) =>
      prev.map((t) => (t.id === lastId ? { ...t, isUsed: false } : t))
    );
  };

  const handleReset = () => {
    if (isAnswered) return;
    setSelectedWordIds([]);
    setAvailableTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })));
  };

  const handleCheck = () => {
    if (isAnswered) return;
    const target = currentSentence.correctWords.join(' ');
    const correct = constructedSentence === target;
    setIsAnswered(true);
    setIsCorrect(correct);

    speakGerman(target);

    if (correct) {
      setScore((prev) => prev + 25);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < sentences.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
            Gap: <span className="font-mono text-white font-bold">{currentIdx + 1} / {sentences.length}</span>
          </div>
          <div className="text-slate-300">
            Ball: <span className="font-mono text-amber-300 font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#101628] border border-slate-800 p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* German Flag Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-[#151515]" />
          <div className="w-1/3 bg-[#de0000]" />
          <div className="w-1/3 bg-[#ffce00]" />
        </div>

        {/* Translation Prompt */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            O'zbekcha tarjimasi:
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            "{currentSentence.translationUz}"
          </h2>
          <span className="inline-block text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Daraja: {currentSentence.level}
          </span>
        </div>

        {/* Constructed Sentence Slot */}
        <div className="min-h-[80px] p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-center gap-2">
          {selectedWordIds.length === 0 ? (
            <span className="text-xs text-slate-500 font-mono italic">
              Quyidagi so'z bo'laklarini to'g'ri grammatik tartibda tanlang...
            </span>
          ) : (
            selectedWordIds.map((id) => {
              const tile = availableTiles.find((t) => t.id === id);
              return (
                <button
                  key={id}
                  onClick={() => handleTileClick(id)}
                  disabled={isAnswered}
                  className="px-3.5 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 font-semibold text-sm hover:bg-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer"
                >
                  {tile?.text}
                </button>
              );
            })
          )}
        </div>

        {/* Available Scrambled Tiles */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 text-center font-medium">
            Mavjud so'z bo'laklari (Satzglieder):
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                disabled={tile.isUsed || isAnswered}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                  tile.isUsed
                    ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-25 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-amber-400 text-slate-100 shadow-md active:scale-95'
                }`}
              >
                {tile.text}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackspace}
              disabled={isAnswered || selectedWordIds.length === 0}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              disabled={isAnswered || selectedWordIds.length === 0}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer text-xs"
            >
              Tozalash
            </button>
          </div>

          {!isAnswered ? (
            <button
              onClick={handleCheck}
              disabled={selectedWordIds.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Tekshirish
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Keyingi gap &rarr;
            </button>
          )}
        </div>

        {/* Feedback & Grammar Note */}
        {isAnswered && (
          <div className="space-y-3">
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
                    {isCorrect ? 'Ofarin! Gap grammatik to\'g\'ri tuzildi.' : 'Tartibda xato bor! To\'g\'ri nemischa gap:'}
                  </div>
                  <div className="text-xs font-mono text-slate-200 mt-0.5">
                    {currentSentence.correctWords.join(' ')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => speakGerman(currentSentence.correctWords.join(' '))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span>Satzbau qoidasi:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentSentence.grammarNote}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
