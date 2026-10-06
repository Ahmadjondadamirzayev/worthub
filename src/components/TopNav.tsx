import React from 'react';
import {
  BookOpen,
  Gamepad2,
  Trophy,
  UserPlus,
  Shield,
  Download,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { UserAccount } from '../types/german';
import { GermanFlagBadge } from './GermanFlagBackdrop';

interface TopNavProps {
  currentTab: 'lektionen' | 'games' | 'leaderboard';
  onTabChange: (tab: 'lektionen' | 'games' | 'leaderboard') => void;
  currentUser: UserAccount;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAdminPanel: () => void;
  onOpenInstallApp: () => void;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  theme,
  onToggleTheme,
  onOpenAdminPanel,
  onOpenInstallApp,
  onLogout,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-30 w-full backdrop-blur-md px-4 lg:px-8 py-2.5 transition-colors border-b ${
        isDark
          ? 'bg-[#0a0d14]/95 border-slate-800/80 text-white'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: German flag badge + worthub.uz Logo */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-4 rounded-xs overflow-hidden flex flex-col border border-white/20 shadow-sm shrink-0">
            <div className="h-1/3 bg-black" />
            <div className="h-1/3 bg-[#de0000]" />
            <div className="h-1/3 bg-[#ffce00]" />
          </div>

          <button
            onClick={() => onTabChange('lektionen')}
            className={`text-lg font-bold tracking-tight hover:text-amber-500 transition-colors cursor-pointer text-left font-sans flex items-center gap-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <span>worthub</span>
            <span className="text-amber-500 font-extrabold">.uz</span>
            <span className="text-[10px] text-slate-400 font-mono align-super">®</span>
          </button>
        </div>

        {/* Center: Clean Nav Menu matching Screenshots */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {/* Lektionlar To'plami */}
          <button
            onClick={() => onTabChange('lektionen')}
            className={`flex items-center gap-2 py-1.5 px-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'lektionen'
                ? 'text-amber-500 font-bold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Lektionlar To'plami</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-mono">
              Darslar
            </span>
            {currentTab === 'lektionen' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full" />
            )}
          </button>

          {/* O'yinlar & Grammatika */}
          <button
            onClick={() => onTabChange('games')}
            className={`flex items-center gap-1.5 py-1.5 px-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'games'
                ? 'text-amber-500 font-bold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-orange-500" />
            <span>O'yinlar & Grammatika</span>
            {currentTab === 'games' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full" />
            )}
          </button>

          {/* O'quvchilar reytingi */}
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center gap-1.5 py-1.5 px-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'leaderboard'
                ? 'text-amber-500 font-bold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>O'quvchilar reytingi</span>
            {currentTab === 'leaderboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right Controls matching Screenshot 1 */}
        <div className="flex items-center gap-2.5">
          {/* Theme toggle icon: Sun for dark -> switch to light; Moon for light -> switch to dark */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "Yorug' rejimga o'tish (Light Mode)" : "Qorong'u rejimga o'tish (Dark Mode)"}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isDark
                ? 'text-amber-400 hover:bg-slate-800 bg-slate-900 border border-slate-800'
                : 'text-indigo-600 hover:bg-slate-100 bg-slate-100 border border-slate-200'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Ilova button (Opens installation modal) */}
          <button
            onClick={onOpenInstallApp}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm border ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Ilova</span>
          </button>

          {/* + Odam qo'shish button (Admin feature) */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl transition-all cursor-pointer shadow-sm shadow-amber-500/5 whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Odam qo'shish</span>
            </button>
          )}

          {/* Admin badge button */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-95 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {/* User profile card */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold hidden sm:inline">
              {currentUser.name}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            title="Tizimdan chiqish"
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div
        className={`md:hidden flex items-center justify-around gap-2 pt-2 mt-2 border-t text-xs ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}
      >
        <button
          onClick={() => onTabChange('lektionen')}
          className={`py-1 px-2 rounded-lg font-semibold ${
            currentTab === 'lektionen'
              ? 'text-amber-400 bg-amber-500/10'
              : isDark
              ? 'text-slate-400'
              : 'text-slate-600'
          }`}
        >
          Lektionlar
        </button>
        <button
          onClick={() => onTabChange('games')}
          className={`py-1 px-2 rounded-lg font-semibold ${
            currentTab === 'games'
              ? 'text-amber-400 bg-amber-500/10'
              : isDark
              ? 'text-slate-400'
              : 'text-slate-600'
          }`}
        >
          O'yinlar
        </button>
        <button
          onClick={() => onTabChange('leaderboard')}
          className={`py-1 px-2 rounded-lg font-semibold ${
            currentTab === 'leaderboard'
              ? 'text-amber-400 bg-amber-500/10'
              : isDark
              ? 'text-slate-400'
              : 'text-slate-600'
          }`}
        >
          Reyting
        </button>
      </div>
    </header>
  );
};
