import React, { useState } from 'react';
import {
  Trophy,
  UserPlus,
  Sparkles,
  Flame,
  Award,
  Medal,
  Layers,
} from 'lucide-react';
import { UserAccount, CefrLevel } from '../types/german';
import { CEFR_COLORS } from '../utils/germanGrammar';

interface LeaderboardViewProps {
  users: UserAccount[];
  theme?: 'dark' | 'light';
  onOpenAddStudent: () => void;
  onGoToGames: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  users,
  theme = 'dark',
  onOpenAddStudent,
  onGoToGames,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<CefrLevel | 'all'>('all');
  const isDark = theme === 'dark';

  const filteredUsers = users.filter((u) => {
    if (selectedFilter !== 'all' && u.assignedLevel !== selectedFilter) return false;
    return true;
  });

  // Sort by XP
  const sortedUsers = [...filteredUsers].sort((a, b) => (b.xp || 0) - (a.xp || 0));

  const filters: (CefrLevel | 'all')[] = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header matching Screenshot 5 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-amber-400">
            <span className="w-4 h-2.5 rounded-xs overflow-hidden flex flex-col border border-white/20">
              <span className="h-1/3 bg-black" />
              <span className="h-1/3 bg-red-600" />
              <span className="h-1/3 bg-yellow-400" />
            </span>
            <span>WORTHUB.UZ O'QUVCHILAR LIGASI</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            O'quvchilar reytingi va ballar jadvali
          </h1>

          <p className="text-xs text-slate-400 max-w-xl">
            Nemis tili darslari, o'yinlardagi faollik va o'zlashtirilgan so'zlar bo'yicha yetakchilar ro'yxati.
          </p>
        </div>

        {/* Action buttons matching Screenshot 5 */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Yangi o'quvchi qo'shish</span>
          </button>

          <button
            onClick={onGoToGames}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-xs cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>O'yinlar bilan ball to'plash</span>
          </button>
        </div>
      </div>

      {/* Filter row matching Screenshot 5 */}
      <div className={`flex items-center justify-between gap-4 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filtr:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === f
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {f === 'all' ? 'Barchasi' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Jami: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{sortedUsers.length} ta</strong>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-3">
        {sortedUsers.map((user, idx) => {
          const rank = idx + 1;

          return (
            <div
              key={user.id}
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isDark
                  ? 'bg-[#121620] border-slate-800/80 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Left info */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    rank === 1
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : isDark
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : rank}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {user.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        user.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : CEFR_COLORS[user.assignedLevel] || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {user.assignedLevel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {user.role === 'admin' ? "O'qituvchi" : "O'quvchi"} · Qo'shilgan: {user.createdAt || '2026-09-28'}
                  </div>
                </div>
              </div>

              {/* Right stats matching Screenshot 5 */}
              <div className="flex items-center gap-6 sm:gap-8 self-end sm:self-auto text-xs">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{user.streakDays || 0} kun</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Faollik</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>{user.wordsCount || 0} ta</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">So'zlar</div>
                </div>

                <div className="text-center min-w-[70px]">
                  <div className="font-bold text-amber-400 text-sm font-mono">
                    {user.xp || 0} XP
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Umumiy ball</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide notice card */}
      <div className={`p-6 rounded-2xl border text-center space-y-3 transition-colors ${
        isDark ? 'bg-[#141824] border-amber-500/20 text-slate-300' : 'bg-white border-amber-300/60 shadow-xs text-slate-700'
      }`}>
        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
          isDark ? 'text-amber-400' : 'text-amber-700'
        }`}>
          <span>🔖</span>
          <span>O'quvchilar reytingi ligasi</span>
        </div>
        <p className={`text-xs max-w-md mx-auto leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Admin panel orqali yangi o'quvchilarni qo'shishingiz bilan ular ushbu reyting jadvaliga avtomatik qo'shiladi va o'yinlardagi faolligi bo'yicha XP ballari hisoblab boriladi!
        </p>
        <button
          onClick={onOpenAddStudent}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-500/10 hover:opacity-95"
        >
          + O'quvchi qo'shish
        </button>
      </div>
    </div>
  );
};
