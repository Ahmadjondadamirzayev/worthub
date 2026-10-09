import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  FileText,
  LogIn,
  CheckCircle2,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { UserAccount, StudentApplication } from '../types/german';
import { WorthubLogo } from './WorthubLogo';

interface LoginViewProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  onSubmitApplication?: (app: Omit<StudentApplication, 'id' | 'status' | 'submittedAt'>) => void;
  theme?: 'dark' | 'light';
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLogin,
  onSubmitApplication,
}) => {
  const isDark = true;
  const [activeTab, setActiveTab] = useState<'login' | 'apply'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Application form state
  const [applName, setApplName] = useState('');
  const [applPhone, setApplPhone] = useState('');
  const [applLevel, setApplLevel] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [applSuccess, setApplSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUser &&
        u.password === cleanPass
    );

    if (matched) {
      onLogin(matched);
    } else {
      setErrorMsg("Login yoki parol noto'g'ri. Iltimos, qaytadan tekshirib ko'ring.");
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applName.trim() || !applPhone.trim()) return;

    if (onSubmitApplication) {
      onSubmitApplication({
        name: applName.trim(),
        phone: applPhone.trim(),
        level: applLevel,
      });
    }

    setApplSuccess(true);
    setApplName('');
    setApplPhone('');
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none transition-colors duration-200 ${
        isDark ? 'bg-[#07090e] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* Top Left Badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2">
        <WorthubLogo size="sm" variant="mark-only" theme="dark" />
        <span
          className={`text-[11px] font-mono font-bold tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-amber-300'
              : 'bg-white/90 border-slate-200 text-amber-700'
          }`}
        >
          BUNDESREPUBLIK DEUTSCHLAND
        </span>
      </div>

      {/* Top Right Status Badge */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        <div
          className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border shadow-sm ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-emerald-400'
              : 'bg-white/90 border-slate-200 text-emerald-600'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>O'quv tizimi faol</span>
        </div>
      </div>

      {/* Atmospheric German Flag Ambient Lights */}
      <div className="absolute inset-0 flex flex-col pointer-events-none opacity-40">
        <div className="flex-1 bg-gradient-to-b from-black via-slate-950 to-transparent" />
        <div className="flex-1 bg-gradient-to-b from-transparent via-red-950/20 to-transparent" />
        <div className="flex-1 bg-gradient-to-t from-amber-950/20 via-transparent to-transparent" />
      </div>

      {/* Central Login Card */}
      <div
        className={`relative z-10 w-full max-w-[440px] rounded-3xl border backdrop-blur-2xl p-7 sm:p-9 shadow-2xl space-y-6 transition-colors ${
          isDark
            ? 'border-red-950/60 bg-[#140e13]/90 shadow-red-950/40 text-slate-100'
            : 'border-slate-200/80 bg-white/95 shadow-slate-200 text-slate-900'
        }`}
      >
        {/* Card Header with Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <WorthubLogo size="lg" variant="full" theme="dark" />
          <p
            className={`text-xs max-w-xs ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Nemis tili so'z boyligi, grammatik darslar va interaktiv o'yinlar portali
          </p>
        </div>

        {/* Tab switchers: Kirish vs Ariza qoldirish */}
        <div
          className={`grid grid-cols-2 p-1 rounded-2xl border text-xs font-semibold ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Kirish</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('apply');
              setErrorMsg('');
              setApplSuccess(false);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'apply'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ariza qoldirish</span>
          </button>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                className={`block text-xs font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Login (Foydalanuvchi nomi)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ahmadjon yoki login"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className={`block text-xs font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all outline-hidden ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>Tizimga kirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Credentials */}
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                isDark ? 'bg-slate-950/40 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tezkor sinov uchun loginlar:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('ahmadjon');
                    setPassword('admin123');
                  }}
                  className={`p-2 rounded-lg border text-left hover:border-amber-500/60 transition-colors cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-bold text-amber-400">O'qituvchi (Admin)</div>
                  <div className="text-slate-400 text-[10px]">ahmadjon / admin123</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('jasur');
                    setPassword('jasur123');
                  }}
                  className={`p-2 rounded-lg border text-left hover:border-amber-500/60 transition-colors cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-bold text-sky-400">O'quvchi (Student)</div>
                  <div className="text-slate-400 text-[10px]">jasur / jasur123</div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: APPLICATION FORM */}
        {activeTab === 'apply' && (
          <div className="space-y-4">
            {applSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-400 text-sm">Arizangiz qabul qilindi!</h4>
                <p className="text-xs text-slate-300">
                  O'qituvchi arizangizni ko'rib chiqib, sizga login va parol tayinlaydi.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Kirish oynasiga qaytish
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3.5">
                <p className="text-xs text-slate-400">
                  Kursda o'qish uchun arizangizni qoldiring. O'qituvchi sizga tizimga kirish logini va parolini beradi.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Ism va Familiyangiz</label>
                  <input
                    type="text"
                    required
                    value={applName}
                    onChange={(e) => setApplName(e.target.value)}
                    placeholder="Masalan: Sardor Aliyev"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Telefon raqamingiz</label>
                  <input
                    type="tel"
                    required
                    value={applPhone}
                    onChange={(e) => setApplPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Nemis tili darajangiz</label>
                  <select
                    value={applLevel}
                    onChange={(e) => setApplLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs outline-hidden focus:border-amber-500"
                  >
                    <option value="A1">A1 — Boshlang'ich (Noldan)</option>
                    <option value="A2">A2 — Elementar</option>
                    <option value="B1">B1 — O'rta (Mittelstufe)</option>
                    <option value="B2">B2 — Yuqori o'rta</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ariza yuborish</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer copyright */}
      <div className="relative z-10 mt-8 text-center text-xs text-slate-400">
        <span>© 2026 Worthub.uz · Nemis tili o'quv platformasi</span>
      </div>
    </div>
  );
};
