import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  Trophy,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { CefrLevel } from '../../types/german';
import { speakGerman } from '../../utils/speech';

interface KasusTrainerGameProps {
  currentLevel: CefrLevel | 'all';
  onBack: () => void;
  theme?: 'dark' | 'light';
}

interface KasusQuestion {
  id: string;
  sentencePre: string;
  nounPrompt: string; // e.g. "der Mann"
  sentencePost: string;
  correctAnswer: string;
  options: string[];
  kasus: 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';
  ruleExplanation: string;
  translationUz: string;
  level: CefrLevel;
}

const KASUS_QUESTIONS: KasusQuestion[] = [
  {
    id: 'k-1',
    sentencePre: 'Ich gebe',
    nounPrompt: 'der Mann (Dativ)',
    sentencePost: 'ein Buch.',
    correctAnswer: 'dem Mann',
    options: ['dem Mann', 'den Mann', 'der Mann', 'des Mannes'],
    kasus: 'Dativ',
    ruleExplanation: 'Geben fe\'li kimga (Wem?) savoliga javob bo\'lib, Dativ talab qiladi: der Mann -> dem Mann.',
    translationUz: 'Men erkakka kitob beryapman.',
    level: 'A1',
  },
  {
    id: 'k-2',
    sentencePre: 'Wir fahren mit',
    nounPrompt: 'der Bus (mit + Dativ)',
    sentencePost: 'zur Arbeit.',
    correctAnswer: 'dem Bus',
    options: ['dem Bus', 'den Bus', 'der Bus', 'des Busses'],
    kasus: 'Dativ',
    ruleExplanation: '"mit" predlogi har doim Dativ talab qiladi: der Bus -> dem Bus.',
    translationUz: 'Biz ishga avtobus bilan boramiz.',
    level: 'A1',
  },
  {
    id: 'k-3',
    sentencePre: 'Er sucht',
    nounPrompt: 'sein Schlüssel (Akkusativ)',
    sentencePost: 'im Zimmer.',
    correctAnswer: 'seinen Schlüssel',
    options: ['seinen Schlüssel', 'seinem Schlüssel', 'sein Schlüssel', 'seines Schlüssels'],
    kasus: 'Akkusativ',
    ruleExplanation: 'Suchen fe\'li kimni/nimani (Wen/Was?) so\'rab, Akkusativ talab qiladi: der Schlüssel -> seinen Schlüssel.',
    translationUz: 'U xonada o\'z kalitini qidirmoqda.',
    level: 'A2',
  },
  {
    id: 'k-4',
    sentencePre: 'Das Geschenk ist für',
    nounPrompt: 'die Mutter (für + Akkusativ)',
    sentencePost: '.',
    correctAnswer: 'die Mutter',
    options: ['die Mutter', 'der Mutter', 'den Mutter', 'einer Mutter'],
    kasus: 'Akkusativ',
    ruleExplanation: '"für" predlogi doim Akkusativ talab qiladi: die Mutter -> die Mutter.',
    translationUz: 'Sovg\'a ona uchun.',
    level: 'A1',
  },
  {
    id: 'k-5',
    sentencePre: 'Wegen',
    nounPrompt: 'das schlechte Wetter (Genitiv)',
    sentencePost: 'bleiben wir zu Hause.',
    correctAnswer: 'des schlechten Wetters',
    options: ['des schlechten Wetters', 'dem schlechten Wetter', 'das schlechte Wetter', 'den schlechten Wetter'],
    kasus: 'Genitiv',
    ruleExplanation: '"wegen" predlogi adabiy tilda Genitiv talab qiladi: das Wetter -> des Wetters.',
    translationUz: 'Yomon ob-havo sababli biz uyda qolamiz.',
    level: 'B1',
  },
  {
    id: 'k-6',
    sentencePre: 'Ich helfe',
    nounPrompt: 'die alte Dame (helfen + Dativ)',
    sentencePost: 'über die Straße.',
    correctAnswer: 'der alten Dame',
    options: ['der alten Dame', 'die alte Dame', 'den alten Damen', 'des alten Dame'],
    kasus: 'Dativ',
    ruleExplanation: 'Helfen fe\'li har doim Dativ boshqaradi: die Dame -> der Dame.',
    translationUz: 'Men keksa xonimga ko\'chani kesib o\'tishda yordam beryapman.',
    level: 'A2',
  },
  {
    id: 'k-7',
    sentencePre: 'Wir gehen durch',
    nounPrompt: 'der schöne Park (durch + Akkusativ)',
    sentencePost: '.',
    correctAnswer: 'den schönen Park',
    options: ['den schönen Park', 'dem schönen Park', 'der schöne Park', 'des schönen Parks'],
    kasus: 'Akkusativ',
    ruleExplanation: '"durch" predlogi doim Akkusativ talab qiladi: der Park -> den Park.',
    translationUz: 'Biz go\'zal bog\' orqali yuryapmiz.',
    level: 'A2',
  },
  {
    id: 'k-8',
    sentencePre: 'Trotz',
    nounPrompt: 'die große Müdigkeit (Genitiv)',
    sentencePost: 'lernt er fleißig weiter.',
    correctAnswer: 'der großen Müdigkeit',
    options: ['der großen Müdigkeit', 'die große Müdigkeit', 'den großen Müdigkeit', 'dem großen Müdigkeit'],
    kasus: 'Genitiv',
    ruleExplanation: '"trotz" predlogi Genitiv oladi: die Müdigkeit -> der Müdigkeit.',
    translationUz: 'Katta charchoqqa qaramasdan u qunt bilan o\'rganishda davom etmoqda.',
    level: 'B2',
  },
];

export const KasusTrainerGame: React.FC<KasusTrainerGameProps> = ({
  currentLevel,
  onBack,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const filtered =
    currentLevel === 'all'
      ? KASUS_QUESTIONS
      : KASUS_QUESTIONS.filter((q) => q.level === currentLevel);
  const questions = filtered.length > 0 ? filtered : KASUS_QUESTIONS;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showTable, setShowTable] = useState(false);

  const currentQ = questions[currentIdx];

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentQ.correctAnswer) {
      setScore((prev) => prev + 15);
    }

    const fullSentence = `${currentQ.sentencePre} ${currentQ.correctAnswer} ${currentQ.sentencePost}`;
    speakGerman(fullSentence);
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCurrentIdx(0);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
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
            onClick={() => setShowTable(!showTable)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-amber-300' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kasus jadvali</span>
          </button>
          <div>
            Mashq: <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentIdx + 1} / {questions.length}</span>
          </div>
          <div>
            Ball: <span className="font-mono text-amber-500 font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Kasus Grammar Table Popup */}
      {showTable && (
        <div className={`p-4 rounded-xl border text-xs space-y-3 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="font-bold text-amber-500">Nemis tili kelishiklari (Kasus):</div>
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className={`p-2 rounded border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="text-sky-500 block">Nominativ</strong>
              der / die / das / die
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="text-emerald-500 block">Akkusativ</strong>
              den / die / das / die
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="text-amber-500 block">Dativ</strong>
              dem / der / dem / den +n
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <strong className="text-purple-500 block">Genitiv</strong>
              des +s / der / des +s / der
            </div>
          </div>
        </div>
      )}

      {/* Main Exercise Card */}
      <div className={`rounded-2xl border p-8 space-y-6 shadow-2xl relative overflow-hidden transition-colors ${
        isDark ? 'bg-gradient-to-br from-slate-900 to-[#101626] border-slate-800 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900'
      }`}>
        {/* German Flag Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-[#151515]" />
          <div className="w-1/3 bg-[#de0000]" />
          <div className="w-1/3 bg-[#ffce00]" />
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
            isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            Kasus: {currentQ.kasus} ({currentQ.level})
          </span>
          <span className={`text-xs font-mono italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {currentQ.translationUz}
          </span>
        </div>

        {/* Fill in the blank sentence */}
        <div className="text-center py-4">
          <div className={`text-xl sm:text-2xl font-bold tracking-wide leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {currentQ.sentencePre}{' '}
            <span className={`px-3 py-1 mx-1.5 rounded-lg border-b-2 underline decoration-wavy ${
              isDark
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 decoration-amber-400'
                : 'bg-amber-100 border-amber-500 text-amber-900 decoration-amber-500'
            }`}>
              {isAnswered ? currentQ.correctAnswer : `[ ${currentQ.nounPrompt} ]`}
            </span>{' '}
            {currentQ.sentencePost}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentQ.correctAnswer;

            let style = isDark
              ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs';

            if (isAnswered) {
              if (isCorrect) style = 'bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold';
              else if (isSelected) style = 'bg-rose-500/15 border-rose-500 text-rose-500';
              else style = isDark ? 'bg-slate-900/50 border-slate-850 text-slate-600' : 'bg-slate-100 border-slate-200 text-slate-400';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
                className={`p-4 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer flex items-center justify-between ${style}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
              </button>
            );
          })}
        </div>

        {/* Explanation Rule */}
        {isAnswered && (
          <div className={`p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-amber-50/50 border-amber-200/60'
          }`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
              <HelpCircle className="w-4 h-4" />
              <span>Grammatik qoidasi va izoh:</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {currentQ.ruleExplanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              {currentIdx + 1 < questions.length ? "Keyingi mashq \u2192" : "Qaytadan boshlash"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
