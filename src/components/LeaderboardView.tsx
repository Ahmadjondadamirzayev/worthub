import React, { useState } from 'react';
import {
  Trophy,
  UserCheck,
  Sparkles,
  Flame,
  Layers,
  ShieldCheck,
  Lock,
  KeyRound,
  LogOut,
  Settings,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Crown,
  Medal,
  Zap,
} from 'lucide-react';
import { UserAccount, CefrLevel } from '../types/german';
import { useLanguage } from '../utils/i18n';

interface LeaderboardViewProps {
  users: UserAccount[];
  currentUser: UserAccount;
  theme?: 'dark' | 'light';
  onOpenAddStudent: () => void;
  onGoToGames: () => void;
  onAdminLogin: (user: UserAccount) => void;
  onLogoutToStudent: () => void;
  onOpenAdminPanel: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  users,
  currentUser,
  theme = 'dark',
  onOpenAddStudent,
  onGoToGames,
  onAdminLogin,
  onLogoutToStudent,
  onOpenAdminPanel,
}) => {
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<CefrLevel | 'all'>('all');
  const isDark = theme === 'dark';

  // Admin switch form state
  const [adminUsername, setAdminUsername] = useState('ahmadjon');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = adminUsername.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    if (!cleanUser || !cleanPass) {
      setAdminError("Iltimos, login va parolni kiriting");
      return;
    }
    setAdminError('');
    setIsSubmitting(true);

    if (cleanUser === 'ahmadjon' && cleanPass === 'admin1') {
      const adminAccount: UserAccount = users.find(
        (u) => u.username.toLowerCase() === 'ahmadjon' && u.role === 'admin'
      ) || {
        id: 'usr-1',
        username: 'ahmadjon',
        password: 'admin1',
        name: 'Ahmadjon Ustoz',
        role: 'admin',
        assignedLevel: 'B2',
        isActive: true,
        lastActive: '2026-09-01',
        xp: 2500,
        streakDays: 45,
        wordsCount: 1500,
        createdAt: '2026-09-01',
      };

      setLoginSuccess(true);
      setTimeout(() => {
        onAdminLogin(adminAccount);
        setIsSubmitting(false);
      }, 400);
      return;
    }

    const foundAdmin = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUser &&
        u.password === cleanPass &&
        u.role === 'admin'
    );

    if (foundAdmin) {
      setLoginSuccess(true);
      setTimeout(() => {
        onAdminLogin(foundAdmin);
        setIsSubmitting(false);
      }, 400);
    } else {
      setAdminError("Login yoki parol noto'g'ri! Faqat admin kirishi mumkin.");
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (selectedFilter !== 'all' && u.assignedLevel !== selectedFilter) return false;
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => (b.xp || 0) - (a.xp || 0));

  // Find current user rank
  const currentUserIndex = sortedUsers.findIndex(
    (u) => u.id === currentUser.id || u.name.toLowerCase() === currentUser.name.toLowerCase()
  );
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : sortedUsers.length + 1;
  const userAbove = currentUserIndex > 0 ? sortedUsers[currentUserIndex - 1] : null;
  const xpNeeded = userAbove ? Math.max(1, (userAbove.xp || 0) - (currentUser.xp || 0) + 5) : 0;

  // Podium (Top 3)
  const top1 = sortedUsers[0];
  const top2 = sortedUsers[1];
  const top3 = sortedUsers[2];

  const filters: (CefrLevel | 'all')[] = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const getLeague = (xp: number) => {
    if (xp >= 1500) return { name: 'Olmos Liga', color: 'text-cyan-400' };
    if (xp >= 700) return { name: 'Oltin Liga', color: 'text-amber-400' };
    if (xp >= 300) return { name: 'Kumush Liga', color: 'text-slate-300' };
    return { name: 'Bronza Liga', color: 'text-amber-600' };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-amber-400">
            <span className="w-4 h-2.5 rounded-xs overflow-hidden flex flex-col border border-white/20">
              <span className="h-1/3 bg-black" />
              <span className="h-1/3 bg-red-600" />
              <span className="h-1/3 bg-yellow-400" />
            </span>
            <span>BLITZ NEMIS TILI MARKAZI</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>O'quvchilar Reytingi</span>
            <Trophy className="w-6 h-6 text-yellow-400" />
          </h1>

          <p className="text-xs text-slate-400 max-w-xl">
            Har kuni so'z yodlang, mini-o'yinlarda qatnashing va ball (XP) to'plab liga cho'qqisiga chiqing!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-orange-500/20 cursor-pointer active:scale-98 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Ismni kiritish</span>
          </button>

          <button
            onClick={onGoToGames}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-white/[0.08] text-slate-200 font-semibold text-xs cursor-pointer transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>O'yinlarda ball to'plash</span>
          </button>
        </div>
      </div>

      {/* User's Personal Position Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#131b2e] to-orange-500/10 border border-amber-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
            #{currentUserRank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{currentUser.name}</span>
              <span className="text-slate-500">·</span>
              <span className={`text-xs font-mono font-semibold ${getLeague(currentUser.xp || 0).color}`}>
                {getLeague(currentUser.xp || 0).name}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {userAbove
                ? `Keyingi o'ringa (#${currentUserRank - 1} ${userAbove.name}) chiqish uchun yana ${xpNeeded} XP to'plang!`
                : "Ajoyib! Siz hozirda reytingda 1-o'rinda bormoqdasiz!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-auto">
          <div className="text-right">
            <div className="text-slate-400 text-[10px]">To'plangan XP</div>
            <div className="text-base font-black text-amber-400">{currentUser.xp || 0} XP</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-[10px]">Faollik</div>
            <div className="text-base font-bold text-orange-400 flex items-center gap-0.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{currentUser.streakDays || 1}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {sortedUsers.length >= 2 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-6 pb-2 max-w-2xl mx-auto">
          {/* 2nd Place */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 border-2 border-slate-300 flex items-center justify-center text-slate-950 font-black text-base sm:text-lg shadow-lg">
                  🥈
                </div>
                <div className="text-center mt-2 max-w-[100px] truncate">
                  <div className="text-xs font-bold text-white truncate">{top2.name}</div>
                  <div className="text-[11px] font-mono text-slate-300">{top2.xp || 0} XP</div>
                </div>
              </div>
              <div className="w-full h-24 rounded-t-2xl bg-gradient-to-b from-slate-700/60 to-slate-900 border-t-2 border-x border-slate-400/40 flex items-center justify-center font-black text-slate-300 text-lg">
                2
              </div>
            </div>
          )}

          {/* 1st Place (Center and Highest) */}
          {top1 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex flex-col items-center">
                <Crown className="w-6 h-6 text-yellow-400 animate-bounce mb-0.5" />
                <div className="w-14 sm:w-20 h-14 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl sm:text-2xl shadow-xl shadow-amber-500/30">
                  🥇
                </div>
                <div className="text-center mt-2 max-w-[120px] truncate">
                  <div className="text-xs sm:text-sm font-black text-amber-300 truncate">{top1.name}</div>
                  <div className="text-xs font-mono font-bold text-white">{top1.xp || 0} XP</div>
                </div>
              </div>
              <div className="w-full h-32 rounded-t-2xl bg-gradient-to-b from-amber-500/30 via-amber-600/20 to-slate-900 border-t-2 border-x border-amber-400 flex items-center justify-center font-black text-amber-400 text-2xl shadow-lg shadow-amber-500/20">
                1
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-600 flex items-center justify-center text-amber-200 font-black text-base sm:text-lg shadow-lg">
                  🥉
                </div>
                <div className="text-center mt-2 max-w-[100px] truncate">
                  <div className="text-xs font-bold text-white truncate">{top3.name}</div>
                  <div className="text-[11px] font-mono text-amber-300/80">{top3.xp || 0} XP</div>
                </div>
              </div>
              <div className="w-full h-18 rounded-t-2xl bg-gradient-to-b from-amber-900/40 to-slate-900 border-t-2 border-x border-amber-700/40 flex items-center justify-center font-black text-amber-600 text-lg">
                3
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter row */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{t('lek_level_filter')}:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === f
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#111726] border border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? t('all') : f}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          O'quvchilar: <strong className="text-white">{sortedUsers.length}</strong>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-2.5">
        {sortedUsers.map((user, idx) => {
          const rank = idx + 1;
          const isMe = user.id === currentUser.id || user.name.toLowerCase() === currentUser.name.toLowerCase();
          const league = getLeague(user.xp || 0);

          return (
            <div
              key={user.id}
              className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                isMe
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                  : 'bg-[#111726] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {/* Left info */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    rank === 1
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-black/40 text-slate-400 border border-white/[0.06]'
                  }`}
                >
                  {rank}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {user.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Siz
                      </span>
                    )}
                    <span className={`text-[11px] font-mono ${league.color}`}>
                      · {league.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {user.role === 'admin' ? t('admin_role_teacher') : user.assignedLevel} · A'zo bo'lgan: {user.createdAt || '2026-09-28'}
                  </div>
                </div>
              </div>

              {/* Right stats */}
              <div className="flex items-center gap-5 sm:gap-6 self-end sm:self-auto text-xs font-mono">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-400 font-bold">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>{user.streakDays || 1}d</span>
                  </div>
                  <div className="text-[10px] text-slate-500">faollik</div>
                </div>

                <div className="text-right min-w-[70px]">
                  <div className="font-black text-amber-400 text-sm">
                    {user.xp || 0} XP
                  </div>
                  <div className="text-[10px] text-slate-500">jami ball</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADMIN SWITCH SECTION */}
      <div className={`rounded-3xl border p-5 sm:p-7 shadow-xl transition-all ${
        isAdmin
          ? 'bg-gradient-to-br from-emerald-950/40 via-[#0e1620] to-slate-900 border-emerald-500/30'
          : 'bg-gradient-to-br from-[#121623] via-[#0d1019] to-[#121623] border-amber-500/30'
      }`}>
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Admin holati faol</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    ✓ Ustoz: {currentUser.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sizda so'zlar, lektionlar va o'quvchilarni tahrirlash huquqi to'liq ochiq.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Boshqaruv paneli</span>
              </button>

              <button
                type="button"
                onClick={onLogoutToStudent}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                title="O'quvchi rejimiga o'tish"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>O'quvchi holatiga qaytish</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Admin holatiga o'tish</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                      Ustoz kabineti
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lektionlar, so'zlar va o'quvchilarni tahrirlash uchun admin login va parolingizni kiriting
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                Admin: <strong className="text-amber-300 font-bold">ahmadjon</strong> / <strong className="text-amber-300 font-bold">admin1</strong>
              </div>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3">
              {adminError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Admin holatiga muvaffaqiyatli o'tildi! Xush kelibsiz!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Login (Foydalanuvchi nomi)
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="ahmadjon"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Paroli
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Parolni kiriting..."
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('ahmadjon');
                    setAdminPassword('admin1');
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono text-left cursor-pointer"
                >
                  ⚡ Tezkor to'ldirish (ahmadjon / admin1)
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Tekshirilmoqda..." : "Admin holatiga o'tish"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
