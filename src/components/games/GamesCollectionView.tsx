import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  Layers,
  Timer,
  SpellCheck,
  HelpCircle,
  BookOpen,
  GitCompare,
  FileCode2,
  Sparkles,
  Flame,
  Filter,
  Play,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { WordItem, CefrLevel, GameModuleId, UserAccount } from '../../types/german';
import { SuperYodlashGame } from './SuperYodlashGame';
import { ArtikelMeisterGame } from './ArtikelMeisterGame';
import { WortPaareGame } from './WortPaareGame';
import { BlitzWortGame } from './BlitzWortGame';
import { BuchstabensalatGame } from './BuchstabensalatGame';
import { WortQuizGame } from './WortQuizGame';
import { KasusTrainerGame } from './KasusTrainerGame';
import { VerbKonjugationGame } from './VerbKonjugationGame';
import { SatzbauProfiGame } from './SatzbauProfiGame';

interface GamesCollectionViewProps {
  words: WordItem[];
  currentUser: UserAccount;
}

interface GameCardMeta {
  id: GameModuleId;
  nameDe: string;
  nameUz: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const GAMES_LIST: GameCardMeta[] = [
  {
    id: 'super-yodlash',
    nameDe: 'Super-Yodlash',
    nameUz: 'Tezkor reaksiya va tezlikda yodlash',
    description: 'Turbo rejimdagi tezkor so\'z oqimi, xotira reaktsiyasi va avtomatik talaffuz bilan maksimal tezlikda mustahkamlash.',
    badge: 'Tezlik & Reaksiya',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: Zap,
    accentColor: 'from-amber-500 to-orange-500',
  },
  {
    id: 'artikel-meister',
    nameDe: 'Artikel-Meister',
    nameUz: 'Der, die, das artikl jangchisi',
    description: 'Nemis tilining eng muhim qoidasi bo\'lgan otlarning jinslarini (der, die, das) mukammal o\'rganish va refleks hosil qilish.',
    badge: 'Artikl & Rod',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    icon: Flame,
    accentColor: 'from-rose-500 to-red-600',
  },
  {
    id: 'wort-paare',
    nameDe: 'Wort-Paare',
    nameUz: 'Xotira va juftliklarni topish',
    description: 'Nemischa so\'zlar va ularning o\'zbekcha tarjimalarini interaktiv kartalar orqali vizual tarzda moslashtirish.',
    badge: 'Xotira & Juftlik',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    icon: Layers,
    accentColor: 'from-sky-500 to-blue-600',
  },
  {
    id: 'blitz-wort',
    nameDe: 'Blitz-Wort',
    nameUz: '60 soniyalik vaqt poygasi',
    description: '60 soniya ichida eng ko\'p so\'z tarjimasini topish. Ketma-ket to\'g\'ri javoblar uchun combo multiplier va rekordlar.',
    badge: '60s Time-Trial',
    badgeColor: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    icon: Timer,
    accentColor: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'buchstabensalat',
    nameDe: 'Buchstabensalat',
    nameUz: 'Harflar salati (Orfografiya)',
    description: 'Aralashib ketgan harflarni bosqichma-bosqich tartiblab, nemischa so\'zni xatosiz imloda tiklash.',
    badge: 'Orfografiya & Imlo',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: SpellCheck,
    accentColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'wort-quiz',
    nameDe: 'Wort-Quiz',
    nameUz: '4 variantli sinov viktorinasi',
    description: 'Nemischa -> O\'zbekcha va O\'zbekcha -> Nemischa yo\'nalishdagi 10 savollik test va yakuniy xatolar tahlili.',
    badge: 'Viktorina & Test',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    icon: HelpCircle,
    accentColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'kasus-trainer',
    nameDe: 'Kasus-Trainer',
    nameUz: 'Kelishiklar (Dativ, Akkusativ, Genitiv)',
    description: 'Haqiqiy nemischa jumlalarda to\'g\'ri predlog va artikl kelishiklarini qo\'llash: dem, den, des, der qoidalari.',
    badge: 'Grammatika & Kasus',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    icon: BookOpen,
    accentColor: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'verb-konjugation',
    nameDe: 'Verb-Konjugation',
    nameUz: 'Nemis fe\'llarini tuslash trenajyori',
    description: 'ich, du, er/sie/es, wir, ihr, sie/Sie shaxslari bo\'yicha to\'g\'ri va noto\'g\'ri fe\'llarni faol tuslash mashqi.',
    badge: 'Fe\'l & Shaxs-son',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    icon: GitCompare,
    accentColor: 'from-cyan-500 to-sky-600',
  },
  {
    id: 'satzbau-profi',
    nameDe: 'Satzbau-Profi',
    nameUz: 'Nemischa gap qurilishi ustasi',
    description: 'So\'z bo\'laklarini nemis tili sintaksis qoidalari (Verb auf Position 2, Nebensatz, Inversion) asosida terish.',
    badge: 'Sintaksis & Gap tuzish',
    badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    icon: FileCode2,
    accentColor: 'from-teal-500 to-emerald-600',
  },
];

const CEFR_LEVELS: { id: CefrLevel | 'all'; label: string; desc: string }[] = [
  { id: 'all', label: 'Barcha darajalar', desc: 'A1–C2 to\'liq lug\'at' },
  { id: 'A1', label: 'A1', desc: 'Boshlang\'ich' },
  { id: 'A2', label: 'A2', desc: 'Asosiy' },
  { id: 'B1', label: 'B1', desc: 'O\'rta' },
  { id: 'B2', label: 'B2', desc: 'Mustaqil' },
  { id: 'C1', label: 'C1', desc: 'Ilg\'or' },
  { id: 'C2', label: 'C2', desc: 'Mukammal' },
];

export const GamesCollectionView: React.FC<GamesCollectionViewProps> = ({
  words,
  currentUser,
}) => {
  // Level filter state: defaults to user's assigned level if available, or 'all'
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | 'all'>(
    currentUser.role === 'student' ? currentUser.assignedLevel : 'all'
  );

  // Active running game state
  const [activeGameId, setActiveGameId] = useState<GameModuleId | null>(null);

  // Dynamically filter words based on selectedLevel
  const filteredWords =
    selectedLevel === 'all'
      ? words
      : words.filter((w) => w.level === selectedLevel);

  // If a game is active, render that specific game module
  if (activeGameId === 'super-yodlash') {
    return (
      <SuperYodlashGame
        words={filteredWords.length > 0 ? filteredWords : words}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'artikel-meister') {
    return (
      <ArtikelMeisterGame
        words={filteredWords.length > 0 ? filteredWords : words}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'wort-paare') {
    return (
      <WortPaareGame
        words={filteredWords.length > 0 ? filteredWords : words}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'blitz-wort') {
    return (
      <BlitzWortGame
        words={filteredWords.length > 0 ? filteredWords : words}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'buchstabensalat') {
    return (
      <BuchstabensalatGame
        words={filteredWords.length > 0 ? filteredWords : words}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'wort-quiz') {
    return (
      <WortQuizGame
        words={filteredWords.length > 0 ? filteredWords : words}
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'kasus-trainer') {
    return (
      <KasusTrainerGame
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'verb-konjugation') {
    return (
      <VerbKonjugationGame
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  if (activeGameId === 'satzbau-profi') {
    return (
      <SatzbauProfiGame
        currentLevel={selectedLevel}
        onBack={() => setActiveGameId(null)}
      />
    );
  }

  // Collection Overview Screen
  return (
    <div className="space-y-8">
      {/* Hero Header with German Flag Theme */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#101524] to-slate-900 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        {/* German Flag Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="w-1/3 bg-[#121212]" />
          <div className="w-1/3 bg-[#de0000]" />
          <div className="w-1/3 bg-[#ffce00]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interaktiv o'yinlar to'plami (9 ta modul)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              O'yinlar orqali nemis tilini o'rganish
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Barcha o'yinlar administrator tomonidan kiritilgan rasmiy lug'atlar bazasi bilan to'g'ridan-to'g'ri bog'langan.
              Kerakli CEFR darajasini (A1–C2) tanlang va bilimingizni mustahkamlang.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <GraduationCap className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-[11px] text-slate-400">Jami so'zlar bazasi:</div>
              <div className="text-base font-bold text-white font-mono">
                {words.length} ta so'z
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level-Based Filtering Bar (Requirement: Selecting level dynamically filters all games!) */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Daraja bo'yicha saralash (Level-Based Filter):</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Tanlangan darajadagi so'zlar: <strong className="text-amber-300">{filteredWords.length} ta</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CEFR_LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white font-semibold border-amber-400 shadow-md shadow-red-600/20'
                    : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{lvl.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({lvl.desc})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of 9 Interactive Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAMES_LIST.map((game) => {
          const Icon = game.icon;

          return (
            <div
              key={game.id}
              className="rounded-2xl bg-gradient-to-br from-slate-900/95 to-[#0d121f] border border-slate-800/80 hover:border-slate-700 p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/40 group relative overflow-hidden"
            >
              {/* Subtle German flag glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 group-hover:bg-amber-500/10 rounded-full blur-2xl transition-all pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${game.accentColor} text-white shadow-md shadow-black/20`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${game.badgeColor}`}>
                    {game.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {game.nameDe}
                  </h3>
                  <div className="text-xs font-semibold text-slate-300">
                    {game.nameUz}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {game.description}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-mono">
                  {selectedLevel === 'all' ? 'To\'liq baza' : `${selectedLevel} daraja`}
                </div>

                <button
                  onClick={() => setActiveGameId(game.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-gradient-to-r hover:from-red-600 hover:to-amber-500 text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm group-hover:shadow-amber-500/10"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>O'ynash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
