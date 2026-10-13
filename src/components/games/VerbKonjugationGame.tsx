import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCw,
  Trophy,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { CefrLevel } from '../../types/german';
import { speakGerman } from '../../utils/speech';

interface VerbKonjugationGameProps {
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
  theme?: 'dark' | 'light';
}

interface VerbConjugationData {
  infinitive: string;
  translationUz: string;
  level: CefrLevel;
  type: 'muntazam' | 'kuchsiz (noto\'g\'ri)' | 'modal';
  forms: {
    pronoun: string;
    uzbekPronoun: string;
    correct: string;
  }[];
}

const VERB_LIST: VerbConjugationData[] = [
  {
    infinitive: 'sein',
    translationUz: 'bo\'lmoq (to be)',
    level: 'A1',
    type: 'kuchsiz (noto\'g\'ri)',
    forms: [
      { pronoun: 'ich', uzbekPronoun: 'men', correct: 'bin' },
      { pronoun: 'du', uzbekPronoun: 'sen', correct: 'bist' },
      { pronoun: 'er / sie / es', uzbekPronoun: 'u', correct: 'ist' },
      { pronoun: 'wir', uzbekPronoun: 'biz', correct: 'sind' },
      { pronoun: 'ihr', uzbekPronoun: 'sizlar', correct: 'seid' },
      { pronoun: 'sie / Sie', uzbekPronoun: 'ular / Siz', correct: 'sind' },
    ],
  },
  {
    infinitive: 'haben',
    translationUz: 'ega bo\'lmoq (to have)',
    level: 'A1',
    type: 'kuchsiz (noto\'g\'ri)',
    forms: [
      { pronoun: 'ich', uzbekPronoun: 'men', correct: 'habe' },
      { pronoun: 'du', uzbekPronoun: 'sen', correct: 'hast' },
      { pronoun: 'er / sie / es', uzbekPronoun: 'u', correct: 'hat' },
      { pronoun: 'wir', uzbekPronoun: 'biz', correct: 'haben' },
      { pronoun: 'ihr', uzbekPronoun: 'sizlar', correct: 'habt' },
      { pronoun: 'sie / Sie', uzbekPronoun: 'ular / Siz', correct: 'haben' },
    ],
  },
  {
    infinitive: 'sprechen',
    translationUz: 'gapirmoq (e -> i almashinishi)',
    level: 'A1',
    type: 'kuchsiz (noto\'g\'ri)',
    forms: [
      { pronoun: 'ich', uzbekPronoun: 'men', correct: 'spreche' },
      { pronoun: 'du', uzbekPronoun: 'sen', correct: 'sprichst' },
      { pronoun: 'er / sie / es', uzbekPronoun: 'u', correct: 'spricht' },
      { pronoun: 'wir', uzbekPronoun: 'biz', correct: 'sprechen' },
      { pronoun: 'ihr', uzbekPronoun: 'sizlar', correct: 'sprecht' },
      { pronoun: 'sie / Sie', uzbekPronoun: 'ular / Siz', correct: 'sprechen' },
    ],
  },
  {
    infinitive: 'fahren',
    translationUz: 'transportda bormoq (a -> ä)',
    level: 'A1',
    type: 'kuchsiz (noto\'g\'ri)',
    forms: [
      { pronoun: 'ich', uzbekPronoun: 'men', correct: 'fahre' },
      { pronoun: 'du', uzbekPronoun: 'sen', correct: 'fährst' },
      { pronoun: 'er / sie / es', uzbekPronoun: 'u', correct: 'fährt' },
      { pronoun: 'wir', uzbekPronoun: 'biz', correct: 'fahren' },
      { pronoun: 'ihr', uzbekPronoun: 'sizlar', correct: 'fahrt' },
      { pronoun: 'sie / Sie', uzbekPronoun: 'ular / Siz', correct: 'fahren' },
    ],
  },
  {
    infinitive: 'arbeiten',
    translationUz: 'ishlamoq (qo\'shimcha -e- oladi)',
    level: 'A1',
    type: 'muntazam',
    forms: [
      { pronoun: 'ich', uzbekPronoun: 'men', correct: 'arbeite' },
      { pronoun: 'du', uzbekPronoun: 'sen', correct: 'arbeitest' },
      { pronoun: 'er / sie / es', uzbekPronoun: 'u', correct: 'arbeitet' },
      { pronoun: 'wir', uzbekPronoun: 'biz', correct: 'arbeiten' },
      { pronoun: 'ihr', uzbekPronoun: 'sizlar', correct: 'arbeitet' },
      { pronoun: 'sie / Sie', uzbekPronoun: 'ular / Siz', correct: 'arbeiten' },
    ],
  },
  {
    infinitive: 'können',
    translationUz: 'qila olmoq (modal fe\'l)',
    level: 'A2',
    type: 'modal',
    forms: [
      { pronoun: 'ich', uzbekPronoun: 'men', correct: 'kann' },
      { pronoun: 'du', uzbekPronoun: 'sen', correct: 'kannst' },
      { pronoun: 'er / sie / es', uzbekPronoun: 'u', correct: 'kann' },
      { pronoun: 'wir', uzbekPronoun: 'biz', correct: 'können' },
      { pronoun: 'ihr', uzbekPronoun: 'sizlar', correct: 'könnt' },
      { pronoun: 'sie / Sie', uzbekPronoun: 'ular / Siz', correct: 'können' },
    ],
  },
];

export const VerbKonjugationGame: React.FC<VerbKonjugationGameProps> = ({
  currentLevel,
  onBack,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const filtered =
    currentLevel === 'all'
      ? VERB_LIST
      : VERB_LIST.filter((v) => v.level === currentLevel);
  const verbs = filtered.length > 0 ? filtered : VERB_LIST;

  const [activeVerbIdx, setActiveVerbIdx] = useState(0);
  const [formInputs, setFormInputs] = useState<Record<number, string>>({});
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);
  const [score, setScore] = useState(0);

  const currentVerb = verbs[activeVerbIdx];

  const handleInputChange = (idx: number, val: string) => {
    setFormInputs((prev) => ({ ...prev, [idx]: val }));
  };

  const handleCheck = () => {
    setIsEvaluated(true);
    let correctCount = 0;
    currentVerb.forms.forEach((f, idx) => {
      const userVal = (formInputs[idx] || '').trim().toLowerCase();
      if (userVal === f.correct.toLowerCase()) {
        correctCount++;
      }
    });
    setScore((prev) => prev + correctCount * 10);
    speakGerman(currentVerb.infinitive);
  };

  const handleNextVerb = () => {
    setFormInputs({});
    setIsEvaluated(false);
    if (activeVerbIdx + 1 < verbs.length) {
      setActiveVerbIdx((prev) => prev + 1);
    } else {
      setActiveVerbIdx(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
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
          <button
            onClick={() => setShowFullTable(!showFullTable)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-amber-300' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>To'liq jadval</span>
          </button>
          <div>
            Fe'l: <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeVerbIdx + 1} / {verbs.length}</span>
          </div>
          <div>
            Ball: <span className="font-mono text-amber-500 font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Conjugation Card */}
      <div className={`rounded-2xl border p-8 space-y-6 shadow-2xl relative overflow-hidden transition-colors ${
        isDark ? 'bg-gradient-to-br from-slate-900 to-[#0e1424] border-slate-800 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900'
      }`}>
        {/* German Flag Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-[#151515]" />
          <div className="w-1/3 bg-[#de0000]" />
          <div className="w-1/3 bg-[#ffce00]" />
        </div>

        {/* Verb Title */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentVerb.infinitive}
            </h2>
            <button
              onClick={() => speakGerman(currentVerb.infinitive)}
              className="p-1 rounded-full text-amber-500 hover:bg-amber-400/10 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {currentVerb.translationUz} · <span className="text-amber-500 font-semibold">{currentVerb.type}</span> ({currentVerb.level})
          </p>
        </div>

        {/* Conjugation Form Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
          {currentVerb.forms.map((form, idx) => {
            const userVal = formInputs[idx] || '';
            const isCorrect = userVal.trim().toLowerCase() === form.correct.toLowerCase();

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isEvaluated
                    ? isCorrect
                      ? isDark ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-emerald-50 border-emerald-400'
                      : isDark ? 'bg-rose-950/40 border-rose-500/50' : 'bg-rose-50 border-rose-400'
                    : isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="w-28">
                  <div className={`font-semibold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{form.pronoun}</div>
                  <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({form.uzbekPronoun})</div>
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={userVal}
                    disabled={isEvaluated}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    placeholder="shakli..."
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-400 ${
                      isDark ? 'bg-slate-900 border-slate-700/80 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  {isEvaluated && !isCorrect && (
                    <div className="text-[11px] font-mono text-emerald-500 mt-1 font-bold">
                      To'g'risi: {form.correct}
                    </div>
                  )}
                </div>

                {isEvaluated && (
                  <div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 pt-2">
          {!isEvaluated ? (
            <button
              onClick={handleCheck}
              className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Tekshirish
            </button>
          ) : (
            <button
              onClick={handleNextVerb}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Keyingi fe'lga o'tish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
