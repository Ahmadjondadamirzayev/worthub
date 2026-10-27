import React from 'react';
import { X, Smartphone, Monitor } from 'lucide-react';
import { WorthubLogo } from './WorthubLogo';
import { useLanguage } from '../utils/i18n';

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
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 transition-colors ${
          isDark
            ? 'bg-[#12151e] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <WorthubLogo size="sm" variant="mark-only" theme={theme} />
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {language === 'ru'
                  ? 'Установить приложение Worthub.uz'
                  : language === 'en'
                  ? 'Install Worthub.uz App'
                  : "Worthub.uz ilovasini o'rnatish"}
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {language === 'ru'
                  ? 'Быстрый доступ и работа офлайн'
                  : language === 'en'
                  ? 'Fast access and offline learning capability'
                  : "Tezkor kirish va internetsiz ishlash imkoniyati"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
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
              <span>Android (Chrome)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {language === 'ru' ? (
                <>Нажмите на три точки (<strong>⋮</strong>) в верхнем правом углу браузера и выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.</>
              ) : language === 'en' ? (
                <>Tap the three dots (<strong>⋮</strong>) in the upper right corner of Chrome and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</>
              ) : (
                <>Brauzerning yuqori o'ng burchagidagi uch nuqtani (<strong>⋮</strong>) bosing va <strong>"Ilovani o'rnatish"</strong> yoki <strong>"Bosh ekranga qo'shish"</strong> tugmasini tanlang.</>
              )}
            </p>
          </div>

          {/* iPhone / iPad */}
          <div className={`p-3.5 rounded-2xl border space-y-1.5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <Smartphone className="w-4 h-4" />
              <span>iPhone & iPad (Safari)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {language === 'ru' ? (
                <>Нажмите кнопку <strong>«Поделиться» (Share)</strong> в нижней панели Safari, затем выберите <strong>«На экран Домой» (Add to Home Screen)</strong>.</>
              ) : language === 'en' ? (
                <>Tap the <strong>"Share"</strong> icon at the bottom of Safari, then choose <strong>"Add to Home Screen"</strong>.</>
              ) : (
                <>Pastki menyudagi <strong>"Ulashish" (Share)</strong> belgisini bosing, so'ngra menyudan <strong>"Bosh ekranga qo'shish" (Add to Home Screen)</strong> bandini bosing.</>
              )}
            </p>
          </div>

          {/* Windows / Mac */}
          <div className={`p-3.5 rounded-2xl border space-y-1.5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Monitor className="w-4 h-4" />
              <span>{language === 'ru' ? 'Компьютер (Windows / Mac)' : language === 'en' ? 'Desktop (Windows / Mac)' : 'Kompyuter (Windows / Mac)'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {language === 'ru' ? (
                <>Нажмите на иконку монитора со стрелкой в правой части адресной строки браузера и нажмите <strong>«Установить»</strong>.</>
              ) : language === 'en' ? (
                <>Click the install/display icon on the right side of the browser address bar and select <strong>"Install"</strong>.</>
              ) : (
                <>Brauzer manzil satrining o'ng tomonidagi kompyuter/strelka belgisini bosing va <strong>"O'rnatish"</strong> tugmasini tanlang.</>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 cursor-pointer"
        >
          {language === 'ru' ? 'Понятно, закрыть' : language === 'en' ? 'Got it, close' : 'Tushundim, yopish'}
        </button>
      </div>
    </div>
  );
};
