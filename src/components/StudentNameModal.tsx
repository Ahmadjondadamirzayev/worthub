import React, { useState } from 'react';
import { UserCheck, Sparkles, Trophy, Award, X, Check, HelpCircle } from 'lucide-react';
import { CefrLevel } from '../types/german';

interface StudentNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentLevel: CefrLevel;
  onSave: (fullName: string, level: CefrLevel) => void;
  theme: 'dark' | 'light';
}

export const StudentNameModal: React.FC<StudentNameModalProps> = ({
  isOpen,
  onClose,
  currentName,
  currentLevel,
  onSave,
  theme,
}) => {
  const [fullName, setFullName] = useState(
    currentName === "Mehmon O'quvchi" || currentName === 'Gast Schüler' ? '' : currentName
  );
  const [level, setLevel] = useState<CefrLevel>(currentLevel || 'A1');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setError("Iltimos, ism va familiyangizni kiriting!");
      return;
    }
    if (trimmed.length < 3) {
      setError("Ism va familiya kamida 3 ta harfdan iborat bo'lishi kerak!");
      return;
    }
    setError('');
    onSave(trimmed, level);
    onClose();
  };

  const isDark = theme === 'dark';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-[#0f1422] border-slate-700/80 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-[#141b2d]' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                O'quvchi sifatida kirish
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">
                  Kirish
                </span>
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ismingiz orqali reytingda o'rningizni egallang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Input field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-amber-500">
              Ism va familiyangiz *
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masalan: Jasur Rahimov yoki Madina Karimova"
                autoFocus
                className={`w-full px-4 py-3 rounded-xl text-base font-medium border outline-none transition-all ${
                  error
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : isDark
                    ? 'bg-[#1a2236] border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15'
                }`}
              />
            </div>
            {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
          </div>

          {/* Level Selection */}
          <div>
            <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Nemis tili darajangiz (CEFR):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['A1', 'A2', 'B1', 'B2'] as CefrLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    level === lvl
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                      : isDark
                      ? 'bg-[#161d2f] border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* User requirement: "pastida tushintirilsin nega ism familya so'ralyotganini qilinsin pastda nega ism familya to'ldiryapsiz chunki ismingiz va familyangiz o'quvchilar reytingida turishi uchun" */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isDark
                ? 'bg-amber-950/25 border-amber-800/40 text-amber-200/90'
                : 'bg-amber-50 border-amber-200/80 text-amber-900'
            }`}
          >
            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed">
              <p className="font-bold text-amber-500 uppercase tracking-wide text-[11px]">
                Nega ism va familiya so'ralyapti?
              </p>
              <p>
                Chunki siz to'playdigan <strong>ballar (XP)</strong>, kunlik faollik va o'yinlardagi natijalaringiz{' '}
                <strong>o'quvchilar reytingida (Leaderboard)</strong> aynan sizning ismingiz va familiyangiz ostida
                saqlanib, faxrli o'rinlarda turishi uchun kerak.
              </p>
            </div>
          </div>

          {/* Daily streak and points note */}
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
              isDark ? 'bg-slate-800/50 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Har kuni saytga kirsangiz:
            </span>
            <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              +15 ball & Streak bonus
            </span>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm border transition-colors ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              Tasdiqlash va Kirish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentNameModal;
