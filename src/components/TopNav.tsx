import React from 'react';
import {
  BookOpen,
  Gamepad2,
  Trophy,
  UserPlus,
  Shield,
  Download,
  LogOut,
} from 'lucide-react';
import { UserAccount } from '../types/german';
import { WorthubLogo } from './WorthubLogo';
import { useLanguage } from '../utils/i18n';
import { LanguageSelector } from './LanguageSelector';

interface TopNavProps {
  currentTab: 'lektionen' | 'games' | 'leaderboard';
  onTabChange: (tab: 'lektionen' | 'games' | 'leaderboard') => void;
  currentUser: UserAccount;
  theme?: 'dark' | 'light';
  onOpenAdminPanel: () => void;
  onOpenInstallApp: () => void;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onOpenAdminPanel,
  onOpenInstallApp,
  onLogout,
}) => {
  const { t } = useLanguage();
  const isAdmin = currentUser.role === 'admin';
  const isDark = true;

  return (
    <header
      className={`sticky top-0 z-30 w-full backdrop-blur-md px-4 lg:px-8 py-2.5 transition-colors border-b ${
        isDark
          ? 'bg-[#0a0d14]/95 border-slate-800/80 text-white'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Official Worthub.uz Brand Logo */}
        <button
          onClick={() => onTabChange('lektionen')}
          className="flex items-center text-left cursor-pointer group transition-transform hover:scale-[1.02] shrink-0"
          title="Worthub.uz"
        >
          <WorthubLogo size="md" variant="full" theme="dark" />
        </button>

        {/* Center: Clean Nav Menu matching Screenshots */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {/* Lektionlar To'plami */}
          <button
            onClick={() => onTabChange('lektionen')}
            className={`flex items-center gap-2 py-1.5 px-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'lektionen'
                ? isDark ? 'text-amber-400 font-bold' : 'text-amber-600 font-bold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>{t('nav_lessons')}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
              isDark
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {t('nav_lessons_badge')}
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
                ? isDark ? 'text-amber-400 font-bold' : 'text-amber-600 font-bold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-orange-500" />
            <span>{t('nav_games')}</span>
            {currentTab === 'games' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full" />
            )}
          </button>

          {/* O'quvchilar reytingi */}
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center gap-1.5 py-1.5 px-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'leaderboard'
                ? isDark ? 'text-amber-400 font-bold' : 'text-amber-600 font-bold'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>{t('nav_leaderboard')}</span>
            {currentTab === 'leaderboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector at the top bar */}
          <LanguageSelector variant="dropdown" />

          {/* Ilova button (Opens installation modal) */}
          <button
            onClick={onOpenInstallApp}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs border ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('nav_app')}</span>
          </button>

          {/* + Odam qo'shish button (Admin feature) */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap border ${
                isDark
                  ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('nav_add_user')}</span>
            </button>
          )}

          {/* Admin badge button */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-95 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('nav_admin')}</span>
            </button>
          )}

          {/* User profile card */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800'
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
            title={t('nav_logout')}
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
          {t('nav_lessons')}
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
          {t('nav_games')}
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
          {t('nav_leaderboard')}
        </button>
      </div>
    </header>
  );
};

