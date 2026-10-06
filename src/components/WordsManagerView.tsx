import React, { useState } from 'react';
import {
  Plus,
  Search,
  Volume2,
  Star,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import {
  WordItem,
  VocabularyLesson,
  GermanArticle,
  CefrLevel,
  UserAccount,
} from '../types/german';
import { ARTICLE_COLORS } from '../utils/germanGrammar';
import { speakGerman } from '../utils/speech';

interface WordsManagerViewProps {
  words: WordItem[];
  lessons: VocabularyLesson[];
  currentUser: UserAccount;
  onOpenAddWord: () => void;
  onEditWord: (word: WordItem) => void;
  onDeleteWord: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export const WordsManagerView: React.FC<WordsManagerViewProps> = ({
  words,
  lessons,
  currentUser,
  onOpenAddWord,
  onEditWord,
  onDeleteWord,
  onToggleStar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<GermanArticle | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | 'all'>('all');
  const [onlyStarred, setOnlyStarred] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const filteredWords = words.filter((w) => {
    if (selectedLesson !== 'all' && w.setId !== selectedLesson) return false;
    if (selectedArticle !== 'all' && w.article !== selectedArticle) return false;
    if (selectedLevel !== 'all' && w.level !== selectedLevel) return false;
    if (onlyStarred && !w.isStarred) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDe = w.german.toLowerCase().includes(q);
      const matchUz = w.uzbek.toLowerCase().includes(q);
      const matchEx = w.exampleSentenceDe?.toLowerCase().includes(q);
      const matchNotes = w.notes?.toLowerCase().includes(q);
      if (!matchDe && !matchUz && !matchEx && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header in Uzbek */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Umumiy nemis tili lug'at daftari
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Barcha darslar (Lektionen) bo'yicha {words.length} ta so'z · O'zbekcha tarjimalari va artikllar bilan
          </p>
        </div>

        {/* Only Admin can add words */}
        {isAdmin && (
          <button
            onClick={onOpenAddWord}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-red-500 to-amber-400 hover:opacity-95 rounded-lg transition-all cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi so'z qo'shish</span>
          </button>
        )}
      </div>

      {/* Filter and Search Box in Uzbek */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Nemischa yoki o'zbekcha so'z izlash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Lesson Selector */}
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="bg-slate-900 text-xs text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer max-w-xs truncate"
          >
            <option value="all">Barcha darslar (Lektionen)</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>

          {/* Article Selector */}
          <select
            value={selectedArticle}
            onChange={(e) => setSelectedArticle(e.target.value as GermanArticle | 'all')}
            className="bg-slate-900 text-xs text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer font-mono"
          >
            <option value="all">Barcha artikllar</option>
            <option value="der">der (Maskulin)</option>
            <option value="die">die (Feminin)</option>
            <option value="das">das (Neutral)</option>
            <option value="none">Artiklsiz</option>
          </select>

          {/* Level Selector */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as CefrLevel | 'all')}
            className="bg-slate-900 text-xs text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer font-mono"
          >
            <option value="all">Barcha darajalar</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
          </select>

          {/* Starred filter button */}
          <button
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              onlyStarred
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-400' : ''}`} />
            <span>Faqat yulduzchalar</span>
          </button>
        </div>
      </div>

      {/* Words Table in Uzbek */}
      <div className="rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                <th className="py-3 px-4 font-medium w-10">Ovoz</th>
                <th className="py-3 px-4 font-medium">Nemischa atama & Artikl</th>
                <th className="py-3 px-4 font-medium">O'zbekcha tarjimasi</th>
                <th className="py-3 px-4 font-medium">Dars (Lektion)</th>
                <th className="py-3 px-4 font-medium">Misol gap</th>
                <th className="py-3 px-4 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => {
                  const artColor = ARTICLE_COLORS[word.article];
                  const parentLesson = lessons.find((l) => l.id === word.setId);

                  return (
                    <tr
                      key={word.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Audio Button */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            const text =
                              word.article !== 'none'
                                ? `${word.article} ${word.german}`
                                : word.german;
                            speakGerman(text);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Talaffuzni eshitish"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* German Word */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {word.article !== 'none' && (
                            <span
                              className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${artColor.bg} ${artColor.text} ${artColor.border}`}
                            >
                              {word.article}
                            </span>
                          )}
                          <span className="font-bold text-white text-sm">
                            {word.german}
                          </span>
                          {word.plural && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({word.plural})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize mt-0.5">
                          {word.partOfSpeech} · {word.level}
                        </div>
                      </td>

                      {/* Uzbek Translation */}
                      <td className="py-3 px-4 font-medium text-amber-300">
                        {word.uzbek}
                        {word.notes && (
                          <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs mt-0.5">
                            {word.notes}
                          </div>
                        )}
                      </td>

                      {/* Lesson (Lektion) */}
                      <td className="py-3 px-4 text-slate-400">
                        <span className="truncate max-w-[140px] inline-block font-mono">
                          {parentLesson?.title || 'Umumiy'}
                        </span>
                      </td>

                      {/* Example sentence */}
                      <td className="py-3 px-4 text-slate-300 italic max-w-xs truncate">
                        {word.exampleSentenceDe || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onToggleStar(word.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Muhim so'z"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                word.isStarred ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>

                          {/* Only Admin can edit/delete */}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => onEditWord(word)}
                                className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors cursor-pointer"
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
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-sm">Filtrga mos so'zlar topilmadi.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info in Uzbek */}
        {filteredWords.length > 0 && (
          <div className="py-3 px-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Jami: {words.length} ta so'zdan {filteredWords.length} tasi ko'rsatilmoqda</span>
            <span className="font-mono text-slate-500">Worthub Nemis tili lug'at bazasi</span>
          </div>
        )}
      </div>
    </div>
  );
};
