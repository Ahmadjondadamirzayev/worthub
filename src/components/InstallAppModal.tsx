import React from 'react';
import { X, Download, Smartphone, Monitor, CheckCircle2, QrCode } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 ${
          isDark
            ? 'bg-[#12151e] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Worthub.uz ilovasini o'rnatish
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tezkor kirish va internetsiz ishlash imkoniyati
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-xs">
          {/* Android */}
          <div className={`p-3.5 rounded-2xl border space-y-1.5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Smartphone className="w-4 h-4" />
              <span>Android (Chrome brauzeri)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Brauzerning yuqori o'ng burchagidagi uch nuqtani (<strong>⋮</strong>) bosing va <strong>"Ilovani o'rnatish"</strong> yoki <strong>"Bosh ekranga qo'shish"</strong> tugmasini tanlang.
            </p>
          </div>

          {/* iPhone / iPad */}
          <div className={`p-3.5 rounded-2xl border space-y-1.5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <Smartphone className="w-4 h-4" />
              <span>iPhone & iPad (Safari brauzeri)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Pastki menyudagi <strong>"Ulashish" (Share)</strong> belgisini bosing, so'ngra menyudan <strong>"Bosh ekranga qo'shish" (Add to Home Screen)</strong> bandini bosing.
            </p>
          </div>

          {/* Windows / Mac */}
          <div className={`p-3.5 rounded-2xl border space-y-1.5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Monitor className="w-4 h-4" />
              <span>Kompyuter (Windows / Mac)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Brauzer manzil satrining o'ng tomonidagi kompyuter/strelka belgisini bosing va <strong>"O'rnatish"</strong> tugmasini tanlang.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 cursor-pointer"
        >
          Tushundim, yopish
        </button>
      </div>
    </div>
  );
};
