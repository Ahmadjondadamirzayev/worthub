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
} from 'lucide-react';
import { UserAccount, StudentApplication } from '../types/german';

interface LoginViewProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  onSubmitApplication?: (app: Omit<StudentApplication, 'id' | 'status' | 'submittedAt'>) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLogin,
  onSubmitApplication,
}) => {
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
      const adminUser = users.find((u) => u.username.toLowerCase() === 'ahmadjon') || {
        id: 'usr-admin',
        username: 'ahmadjon',
        password: 'admin1',
        name: 'Ahmadjon (O\'qituvchi)',
        role: 'admin' as const,
        assignedLevel: 'C1' as const,
        isActive: true,
        createdAt: '2026-09-28',
        lastActive: new Date().toISOString().slice(0, 10),
      };
      onLogin(adminUser);
      return;
    }

    // Check other registered accounts
    const found = users.find(
      (u) => u.username.toLowerCase() === trimmedUser && u.password === password
    );

    if (!found) {
      setErrorMsg('Noto\'g\'ri login yoki parol. Iltimos, ma\'lumotlaringizni tekshirib qaytadan kiriting.');
      return;
    }

    if (!found.isActive) {
      setErrorMsg('Ushbu hisob administrator tomonidan vaqtincha to\'xtatilgan.');
      return;
    }

    onLogin(found);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) return;

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Top Left Badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono font-bold tracking-wider text-amber-300 shadow-lg">
        <span className="w-3.5 h-2.5 rounded-xs overflow-hidden flex flex-col border border-white/20">
          <span className="h-1/3 bg-black" />
          <span className="h-1/3 bg-red-600" />
          <span className="h-1/3 bg-yellow-400" />
        </span>
        <span>BUNDESREPUBLIK DEUTSCHLAND</span>
      </div>

      {/* Top Right Status Badge */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-emerald-400 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>O'quv tizimi faol</span>
      </div>

      {/* Atmospheric German Flag Horizontal Glowing Background (Black, Red, Gold) */}
      <div className="absolute inset-0 flex flex-col pointer-events-none opacity-45">
        <div className="flex-1 bg-gradient-to-b from-[#090b10] to-[#250808]" />
        <div className="flex-1 bg-gradient-to-b from-[#8f0d0d] via-[#ad1818] to-[#993b04] blur-[80px]" />
        <div className="flex-1 bg-gradient-to-b from-[#b37000] via-[#c99700] to-[#07090e] blur-[90px]" />
      </div>

      {/* Central Login Card */}
      <div className="relative z-10 w-full max-w-[430px] rounded-3xl border border-red-900/40 bg-[#160d0e]/90 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-red-950/60 space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300">
            <span className="w-3.5 h-2.5 rounded-xs overflow-hidden flex flex-col border border-white/20">
              <span className="h-1/3 bg-black" />
              <span className="h-1/3 bg-red-600" />
              <span className="h-1/3 bg-yellow-400" />
            </span>
            <span>DEUTSCHLAND</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            worthub<span className="text-amber-400">.uz</span>
          </h1>

          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Nemis tili so'z boyligi va interaktiv o'yinlar portali
          </p>
        </div>

        {/* Tab switchers: Kirish vs Ariza qoldirish */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Kirish (Anmelden)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ariza qoldirish</span>
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Login (Foydalanuvchi nomi):
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Masalan: ahmadjon yoki o'quvchi logini"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1e1315]/80 border border-red-900/40 hover:border-amber-500/40 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Parol:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e1315]/80 border border-red-900/40 hover:border-amber-500/40 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
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

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('apply')}
                className="text-xs text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              >
                Akkauntingiz yo'qmi? Ariza qoldiring &rarr;
              </button>
            </div>
          </form>
        ) : (
          /* Application Form */
          <form onSubmit={handleApplicationSubmit} className="space-y-4 pt-1">
            {appSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
                <div className="font-bold">Arizangiz muvaffaqiyatli qabul qilindi!</div>
                <div className="text-[11px] text-slate-300">
                  O'qituvchi sizga tez orada login va parol taqdim etadi.
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ism-familiyangiz: *
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Azizbek Rahimov"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-[#1e1315]/80 border border-red-900/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telefon raqamingiz: *
                  </label>
                  <input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full bg-[#1e1315]/80 border border-red-900/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    O'rganmoqchi bo'lgan darajangiz:
                  </label>
                  <select
                    value={applicantLevel}
                    onChange={(e) => setApplicantLevel(e.target.value as any)}
                    className="w-full bg-[#1e1315] border border-red-900/40 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
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

        {/* Footnote */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-400/80 pt-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Goethe-Institut va Duden standartlari</span>
        </div>
      </div>
    </div>
  );
};
