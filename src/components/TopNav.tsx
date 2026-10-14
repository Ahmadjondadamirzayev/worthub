import React from 'react';
import {
  BookOpen,
  Gamepad2,
  Trophy,
  UserPlus,
  Shield,
  Download,
  LogOut,
  User as UserIcon,
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
    <>
      {/* Top Header Bar */}
      <header
        className={`sticky top-0 z-30 w-full backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 transition-colors border-b ${
          isDark
            ? 'bg-[#0a0d14]/95 border-slate-800/80 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Official Worthub.uz Brand Logo */}
          <button
            onClick={() => onTabChange('lektionen')}
            className="flex items-center text-left cursor-pointer group transition-transform active:scale-95 shrink-0"
            title="Worthub.uz"
          >
            <div className="hidden sm:block">
              <WorthubLogo size="md" variant="full" theme="dark" />
            </div>
            <div className="sm:hidden">
              <WorthubLogo size="sm" variant="compact" theme="dark" />
            </div>
          </button>

          {/* Center: Desktop Nav Menu */}
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector */}
            <LanguageSelector variant="dropdown" />

            {/* Install App button (Desktop) */}
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

            {/* + Odam qo'shish button (Admin desktop) */}
            {isAdmin && (
              <button
                onClick={onOpenAdminPanel}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap border ${
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
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-95 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20 whitespace-nowrap"
                title={t('nav_admin')}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav_admin')}</span>
              </button>
            )}

            {/* User profile card */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs max-w-[140px] truncate ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
              title={currentUser.name}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold truncate text-[11px] sm:text-xs">
                {currentUser.name.split(' ')[0]}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title={t('nav_logout')}
              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Modern Mobile Bottom Navigation Bar (Duolingo/Native App style) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d14]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {/* Tab 1: Lektionen */}
          <button
            type="button"
            onClick={() => onTabChange('lektionen')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'lektionen'
                ? 'bg-amber-500/15 text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className={`w-5 h-5 mb-0.5 ${currentTab === 'lektionen' ? 'text-amber-400 stroke-[2.5]' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight">{t('nav_lessons')}</span>
          </button>

          {/* Tab 2: Games */}
          <button
            type="button"
            onClick={() => onTabChange('games')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'games'
                ? 'bg-amber-500/15 text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className={`w-5 h-5 mb-0.5 ${currentTab === 'games' ? 'text-orange-400 stroke-[2.5]' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight">{t('nav_games')}</span>
          </button>

          {/* Tab 3: Leaderboard */}
          <button
            type="button"
            onClick={() => onTabChange('leaderboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'leaderboard'
                ? 'bg-amber-500/15 text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className={`w-5 h-5 mb-0.5 ${currentTab === 'leaderboard' ? 'text-yellow-400 stroke-[2.5]' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight">{t('nav_leaderboard')}</span>
          </button>

          {/* Tab 4: Admin (if admin) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-amber-300"
            >
              <Shield className="w-5 h-5 mb-0.5 text-amber-400" />
              <span className="text-[10px] tracking-tight">{t('nav_admin')}</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
