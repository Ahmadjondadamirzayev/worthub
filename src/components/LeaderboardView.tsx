import React, { useState } from 'react';
import {
  Trophy,
  UserPlus, UserCheck,
  Sparkles,
  Flame,
  Award,
  Medal,
  Layers,
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  LogOut,
  Settings,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { UserAccount, CefrLevel } from '../types/german';
import { CEFR_COLORS } from '../utils/germanGrammar';
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

    // Direct check for master admin credentials (ahmadjon / admin1)
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

    // Check against other created admin accounts
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
            <span>{t('lead_badge')}</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('lead_title')}
          </h1>

          <p className="text-xs text-slate-400 max-w-xl">
            {t('lead_desc')}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Kirish / Ismni kiritish</span>
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
            <span>{t('lead_games_btn')}</span>
          </button>
        </div>
      </div>

      {/* Filter row matching Screenshot 5 */}
      <div className={`flex items-center justify-between gap-4 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{t('lek_level_filter')}:</span>
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
                {f === 'all' ? t('all') : f}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          {t('all')}: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{sortedUsers.length}</strong>
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
                    {user.role === 'admin' ? t('admin_role_teacher') : t('admin_role_student')} · {t('lead_joined')} {user.createdAt || '2026-09-28'}
                  </div>
                </div>
              </div>

              {/* Right stats matching Screenshot 5 */}
              <div className="flex items-center gap-6 sm:gap-8 self-end sm:self-auto text-xs">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{user.streakDays || 0} {t('lead_days_suffix')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{t('lead_activity')}</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>{user.wordsCount || 0} {t('lead_words_suffix')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{t('words_count')}</div>
                </div>

                <div className="text-center min-w-[70px]">
                  <div className="font-bold text-amber-400 text-sm font-mono">
                    {user.xp || 0} XP
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{t('lead_total_score')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide notice card */}
      <div className={`p-5 rounded-2xl border text-center space-y-3 transition-colors ${
        isDark ? 'bg-[#141824] border-amber-500/20 text-slate-300' : 'bg-white border-amber-300/60 shadow-xs text-slate-700'
      }`}>
        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
          isDark ? 'text-amber-400' : 'text-amber-700'
        }`}>
          <span>🔖</span>
          <span>{t('lead_guide_badge')}</span>
        </div>
        <p className={`text-xs max-w-md mx-auto leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {t('lead_guide_desc')}
        </p>
      </div>

      {/* ADMIN HOLATIGA O'TISH SECTION (User request: "o'quvchilar reytingi pastiga admin holatga o'tish qiib meni loginim va parolim bo'lsin") */}
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
                  <div className="relative">
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="ahmadjon"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Paroli
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Parolni kiriting..."
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
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
