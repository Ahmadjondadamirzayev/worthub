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
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantLevel, setApplicantLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1');
  const [appSubmitted, setAppSubmitted] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim().toLowerCase();

    // Check fixed master admin access first
    if (trimmedUser === 'ahmadjon' && password === 'admin1') {
      const adminUser: UserAccount = users.find((u) => u.username.toLowerCase() === 'ahmadjon') || {
        id: 'usr-admin',
        username: 'ahmadjon',
        password: 'admin1',
        name: "Ahmadjon (O'qituvchi)",
        role: 'admin' as const,
        assignedLevel: 'C1' as const,
        isActive: true,
        createdAt: '2026-09-01',
        lastActive: '2026-10-08',
        xp: 1500,
        streakDays: 14,
        wordsCount: 120,
      };
      onLogin(adminUser);
      return;
    }

    // Check regular users or custom admins
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === trimmedUser && u.password === password
    );

    if (foundUser) {
      if (foundUser.isActive === false) {
        setErrorMsg('Ushbu hisob admin tomonidan vaqtincha bloklangan.');
        return;
      }
      onLogin(foundUser);
    } else {
      setErrorMsg("Login yoki parol noto'g'ri kiritildi. Qaytadan urinib ko'ring.");
    }
  };

  const handleFillAdmin = () => {
    setUsername('ahmadjon');
    setPassword('admin1');
    setErrorMsg('');
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) {
      setErrorMsg("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    if (onSubmitApplication) {
      onSubmitApplication({
        name: applicantName.trim(),
        phone: applicantPhone.trim(),
        level: applicantLevel,
      });
    }

    setAppSubmitted(true);
    setTimeout(() => {
      setAppSubmitted(false);
      setActiveTab('login');
      setApplicantName('');
      setApplicantPhone('');
    }, 2500);
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

      {/* Top Right Status Badge & Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-medium shadow-sm ${
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
        <div
          className={`flex-1 ${
            isDark
              ? 'bg-gradient-to-b from-[#090b10] to-[#250808]'
              : 'bg-gradient-to-b from-slate-100 to-amber-50/40'
          }`}
        />
        <div
          className={`flex-1 blur-[90px] ${
            isDark
              ? 'bg-gradient-to-b from-[#8f0d0d] via-[#ad1818] to-[#993b04]'
              : 'bg-gradient-to-b from-red-500/10 via-orange-500/10 to-amber-500/10'
          }`}
        />
        <div
          className={`flex-1 blur-[100px] ${
            isDark
              ? 'bg-gradient-to-b from-[#b37000] via-[#c99700] to-[#07090e]'
              : 'bg-gradient-to-b from-amber-400/10 to-transparent'
          }`}
        />
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
          className={`grid grid-cols-2 gap-1.5 p-1 rounded-2xl border ${
            isDark ? 'bg-black/50 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-md shadow-orange-600/20'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Kirish (Anmelden)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-md shadow-orange-600/20'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ariza qoldirish</span>
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                Login (Foydalanuvchi nomi):
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Masalan: ahmadjon yoki o'quvchi logini"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-mono transition-colors border ${
                    isDark
                      ? 'bg-[#1b1419]/90 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                  }`}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                Parol:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono transition-colors border ${
                    isDark
                      ? 'bg-[#1b1419]/90 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-600/30 mt-2"
            >
              <span>Tizimga kirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick admin login button for convenience */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFillAdmin}
                className={`w-full py-2 px-3 text-[11px] font-mono rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>O'qituvchi sifatida sinash (ahmadjon / admin1)</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleApplicationSubmit} className="space-y-3.5 pt-1">
            {appSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                <div className="font-bold">Arizangiz muvaffaqiyatli qabul qilindi!</div>
                <div className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  O'qituvchi sizga tez orada login va parol taqdim etadi.
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    Ism-familiyangiz: *
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Azizbek Rahimov"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs transition-colors border ${
                      isDark
                        ? 'bg-[#1b1419]/90 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    Telefon raqamingiz: *
                  </label>
                  <input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors border ${
                      isDark
                        ? 'bg-[#1b1419]/90 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    O'rganmoqchi bo'lgan darajangiz:
                  </label>
                  <select
                    value={applicantLevel}
                    onChange={(e) => setApplicantLevel(e.target.value as any)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono transition-colors border ${
                      isDark
                        ? 'bg-[#1b1419] border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white'
                    }`}
                  >
                    <option value="A1">A1 — Boshlang'ich</option>
                    <option value="A2">A2 — Boshlang'ich davomiy</option>
                    <option value="B1">B1 — O'rta daraja</option>
                    <option value="B2">B2 — Mustaqil</option>
                    <option value="C1">C1 — Ilg'or</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Arizani yuborish
                </button>
              </>
            )}
          </form>
        )}
      </div>

      {/* Footer info note */}
      <div
        className={`relative z-10 mt-6 text-center text-xs flex items-center gap-2 ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        <Info className="w-3.5 h-3.5" />
        <span>Worthub.uz — O'zbekiston yoshlari uchun nemis tili o'rganish platformasi</span>
      </div>
    </div>
  );
};
