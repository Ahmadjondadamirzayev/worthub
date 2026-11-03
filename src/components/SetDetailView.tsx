import React, { useState } from 'react';
import {
  ArrowLeft,
  Layers,
  GraduationCap,
  Zap,
  Edit3,
  Plus,
  Volume2,
  Star,
  Edit2,
  Trash2,
  Flame,
  Search,
} from 'lucide-react';
import { VocabularyLesson, WordItem, StudyMode, UserAccount } from '../types/german';
import { ARTICLE_COLORS, CEFR_COLORS } from '../utils/germanGrammar';
import { speakGerman } from '../utils/speech';

interface SetDetailViewProps {
  lesson: VocabularyLesson;
  words: WordItem[];
  currentUser: UserAccount;
  onBack: () => void;
  onStartStudyMode: (mode: StudyMode) => void;
  onOpenAddWord: (defaultSetId: string) => void;
  onEditWord: (word: WordItem) => void;
  onDeleteWord: (wordId: string) => void;
  onToggleStar: (wordId: string) => void;
}

export const SetDetailView: React.FC<SetDetailViewProps> = ({
  lesson,
  words,
  currentUser,
  onBack,
  onStartStudyMode,
  onOpenAddWord,
  onEditWord,
  onDeleteWord,
  onToggleStar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = currentUser.role === 'admin';

  const filteredWords = words.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.german.toLowerCase().includes(q) ||
      w.uzbek.toLowerCase().includes(q) ||
      w.notes?.toLowerCase().includes(q)
    );
  });

  const studyModes: Array<{
    id: StudyMode;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'flashcards',
      title: 'Lug\'at kartalari',
      subtitle: '3D kartalar & eslab qolish',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
    },
    {
      id: 'learn',
      title: 'Viktorina Test',
      subtitle: '4-variantli interaktiv test',
      icon: <GraduationCap className="w-5 h-5 text-sky-400" />,
      color: 'hover:border-sky-500/50 hover:bg-sky-500/10',
    },
    {
      id: 'match',
      title: 'Juftliklarni topish',
      subtitle: 'Vaqtga qarshi moslashtirish',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10',
    },
    {
      id: 'spell',
      title: 'Yozish & Diktant',
      subtitle: 'Eshitib to\'g\'ri yozish',
      icon: <Edit3 className="w-5 h-5 text-purple-400" />,
      color: 'hover:border-purple-500/50 hover:bg-purple-500/10',
    },
    {
      id: 'articles',
      title: 'Artikl Jangchisi',
      subtitle: 'der · die · das maxsus o\'yini',
      icon: <Flame className="w-5 h-5 text-red-400" />,
      color: 'hover:border-red-500/50 hover:bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha darslarga qaytish</span>
        </button>
      </div>

      {/* Lesson Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#111827]/90 to-[#0c121d]/90 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        {/* Subtle German flag ribbon on card */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-[#111]" />
          <div className="w-1/3 bg-[#de0000]" />
          <div className="w-1/3 bg-[#ffce00]" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded font-mono font-semibold border ${CEFR_COLORS[lesson.level]}`}>
                Daraja: {lesson.level}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                · {lesson.germanTitle}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {lesson.title}
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              {lesson.description}
            </p>
          </div>

          {/* Only Admin can add words */}
          {isAdmin && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => onOpenAddWord(lesson.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-red-500 to-amber-400 hover:opacity-95 rounded-lg transition-all cursor-pointer shadow-sm shadow-amber-500/10 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Ushbu darsga so'z qo'shish</span>
              </button>
            </div>
          )}
        </div>

        {/* 5 Interactive Games / Study Modes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          {studyModes.map((mode) => (
            <button
              key={mode.id}
              disabled={words.length === 0}
              onClick={() => onStartStudyMode(mode.id)}
              className={`p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-left transition-all cursor-pointer group flex flex-col justify-between h-28 ${mode.color} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <div className="p-2 rounded-lg bg-slate-800/80 w-fit group-hover:scale-105 transition-transform">
                {mode.icon}
              </div>
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-amber-300 truncate">
                  {mode.title}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {mode.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Words in this lesson */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Darsdagi so'zlar ro'yxati ({words.length})
            </h2>
            <p className="text-xs text-slate-400">
              Grammatik artikl (der, die, das), o'zbekcha tarjimasi va nemischa namunaviy gaplar
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Ushbu darsda so'z izlash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredWords.length > 0 ? (
            filteredWords.map((word) => {
              const artColor = ARTICLE_COLORS[word.article];

              return (
                <div
                  key={word.id}
                  className="p-4 rounded-xl border border-slate-800/80 bg-[#111827]/70 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => {
                        const text =
                          word.article !== 'none'
                            ? `${word.article} ${word.german}`
                            : word.german;
                        speakGerman(text);
                      }}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer shrink-0 mt-0.5"
                      title="Talaffuzni eshitish"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {word.article !== 'none' && (
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${artColor.bg} ${artColor.text} ${artColor.border}`}
                          >
                            {word.article}
                          </span>
                        )}
                        <span className="text-base font-bold text-white">
                          {word.german}
                        </span>
                        {word.plural && (
                          <span className="text-xs font-mono text-slate-400">
                            ({word.plural})
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 capitalize">
                          · {word.partOfSpeech}
                        </span>
                      </div>

                      {/* Example sentences */}
                      {word.exampleSentenceDe && (
                        <div className="text-xs text-slate-300 italic">
                          "{word.exampleSentenceDe}"
                        </div>
                      )}
                      {word.exampleSentenceUz && (
                        <div className="text-[11px] text-slate-500 italic">
                          Tarjimasi: "{word.exampleSentenceUz}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Uzbek translation & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-amber-300">
                        {word.uzbek}
                      </div>
                      {word.notes && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {word.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleStar(word.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Muhim so'z"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            word.isStarred ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>

                      {/* Only Admin can edit or delete words */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEditWord(word)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteWord(word.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              Ushbu darsda so'zlar topilmadi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
