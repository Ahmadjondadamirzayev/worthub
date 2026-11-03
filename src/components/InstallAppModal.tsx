import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Download,
  CheckCircle2,
  Sparkles,
  Share2,
  PlusSquare,
  ShieldCheck,
  Zap,
  Globe,
  ChevronRight,
  Info,
} from 'lucide-react';
import { WorthubLogo } from './WorthubLogo';
import { useLanguage } from '../utils/i18n';
import { usePWAInstall } from '../utils/usePWAInstall';

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
  const { isInstallable, isInstalled, isIOS, isDesktop, install } = usePWAInstall();

  // Active platform tab: 'desktop' or 'mobile'
  const [platformTab, setPlatformTab] = useState<'desktop' | 'mobile'>(
    isDesktop ? 'desktop' : 'mobile'
  );

  // For mobile tab: 'android' or 'ios'
  const [mobileOs, setMobileOs] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  const [installTriggered, setInstallTriggered] = useState(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleDirectInstall = async () => {
    setInstallTriggered(true);
    const success = await install();
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        className={`relative w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          isDark
            ? 'bg-[#0f1422] border-slate-800 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Modal Top Bar with Brand Badge */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800/90 bg-[#141b2d]/80' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <WorthubLogo size="md" variant="mark-only" theme={theme} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  {language === 'ru'
                    ? 'Установить приложение Worthub'
                    : language === 'en'
                    ? 'Install Worthub Application'
                    : "Worthub Ilovasini O'rnatish"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  PWA v3.0
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {language === 'ru'
                  ? 'Официальное приложение для ПК и телефонов'
                  : language === 'en'
                  ? 'Official app for Computers and Mobile devices'
                  : "Kompyuter va telefonlar uchun rasmiy o'rnatiladigan ilova"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Yopish"
            className={`p-2 rounded-xl cursor-pointer transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs: Kompyuter vs Telefon */}
        <div className={`p-3 border-b flex items-center gap-2 ${isDark ? 'border-slate-800 bg-[#0b0e17]' : 'border-slate-100 bg-slate-100/70'}`}>
          <button
            type="button"
            onClick={() => setPlatformTab('desktop')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              platformTab === 'desktop'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : isDark
                ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>💻 Kompyuter uchun (PC / Mac)</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatformTab('mobile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              platformTab === 'mobile'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20'
                : isDark
                ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Telefon uchun (Android / iOS)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Status banner if already running as installed app */}
          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block font-bold">Worthub ilovasi allaqachon o'rnatilgan!</strong>
                <span className="text-[11px] text-emerald-200/90">
                  Siz ushbu qurilmada mustaqil ilova ko'rinishida foydalanmoqdasiz.
                </span>
              </div>
            </div>
          )}

          {/* TAB 1: KOMPYUTER UCHUN (PC / Windows / Mac / Linux) */}
          {platformTab === 'desktop' && (
            <div className="space-y-4 animate-fade-in">
              {/* Desktop App Card */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDark ? 'bg-gradient-to-br from-slate-900 to-[#161c2c] border-emerald-500/30' : 'bg-slate-50 border-emerald-500/40 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0a0d14] border border-amber-500/30 flex items-center justify-center p-1.5 shadow-md shrink-0">
                    <img src="/logo.svg" alt="Worthub" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                      <span>Worthub Desktop App</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Windows & macOS
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Alohida darcha, tezkor klaviatura buyruqlari va to'liq oflayn rejimi
                    </p>
                  </div>
                </div>

                {/* 1-Click Native Install Button for Chromium/Edge */}
                {isInstallable && (
                  <button
                    type="button"
                    onClick={handleDirectInstall}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Kompyuterga O'rnatish</span>
                  </button>
                )}
              </div>

              {/* Step-by-Step Desktop Instructions */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-300 text-xs flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  <span>Kompyuterda o'rnatish yo'riqnomasi:</span>
                </h5>

                {/* Method 1: Address Bar Install Icon */}
                <div className={`p-3.5 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px] font-mono">1</span>
                      <span>Google Chrome & Microsoft Edge (Manzil satridan)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Eng oson yo'li</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Brauzeringizning yuqori qismidagi manzil satrining (URL) o'ng tomonida turgan <strong>kompyuter/strelka (O'rnatish)</strong> belgisini bosing va <strong>"O'rnatish" (Install)</strong> tugmasini tanlang.
                  </p>
                  <div className="p-2 rounded-xl bg-black/40 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                    <span className="text-amber-400">Belgi:</span>
                    <span>🌐 https://worthub.uz</span>
                    <span className="ml-auto px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                      [+] O'rnatish
                    </span>
                  </div>
                </div>

                {/* Method 2: Browser 3-Dots Menu */}
                <div className={`p-3.5 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[11px] font-mono">2</span>
                    <span>Brauzer menyusi orqali (Barcha brauzerlar)</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Brauzerning o'ng yuqorisidagi uch nuqta (<strong>⋮</strong>) yoki menyuni bosing va <strong>"Worthub.uz ilovasini o'rnatish"</strong> (yoki <em>"Bosh ekranga qo'shish" / "Cast & save"</em>) tugmasini bosing.
                  </p>
                </div>
              </div>

              {/* Desktop App Advantages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <Zap className="w-3.5 h-3.5 text-amber-400 mb-1" />
                  <div className="font-bold text-[11px] text-slate-200">Alohida Darcha</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Brauzer tablarisiz toza ilova</div>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                  <div className="font-bold text-[11px] text-slate-200">Ish Stoli Belgisi</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Desktop va Pusk menyusida turadi</div>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 mb-1" />
                  <div className="font-bold text-[11px] text-slate-200">Tezkor Yuklanish</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Keshdan bir soniyada ochiladi</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEFON UCHUN (Android & iOS) */}
          {platformTab === 'mobile' && (
            <div className="space-y-4 animate-fade-in">
              {/* Mobile Sub-selector (Android vs iPhone) */}
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/30 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMobileOs('android')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileOs === 'android'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🤖 Android (Samsung, Redmi, barchasi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOs('ios')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileOs === 'ios'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🍏 iPhone & iPad (iOS Safari)</span>
                </button>
              </div>

              {/* Android Flow */}
              {mobileOs === 'android' && (
                <div className="space-y-3 animate-fade-in">
                  <div
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                      isDark ? 'bg-[#141b2b] border-amber-500/30' : 'bg-amber-50/50 border-amber-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0a0d14] border border-amber-500/30 flex items-center justify-center p-1.5 shadow-md shrink-0">
                        <img src="/logo.svg" alt="Worthub" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                          <span>Worthub Android App</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            APK shart emas
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Telefonda xotiradan joy olmaydi va to'liq mustaqil ilova bo'lib ishlaydi
                        </p>
                      </div>
                    </div>

                    {isInstallable && (
                      <button
                        type="button"
                        onClick={handleDirectInstall}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span>Telefonga O'rnatish</span>
                      </button>
                    )}
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      <span>Androidda qo'lda o'rnatish yo'riqnomasi:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                      <li>Chrome yoki Samsung brauzerida ushbu saytni oching.</li>
                      <li>Yuqori o'ng burchakdagi uch nuqtani (<strong>⋮</strong>) bosing.</li>
                      <li>Menyudan <strong>"Ilovani o'rnatish"</strong> yoki <strong>"Bosh ekranga qo'shish"</strong> tugmasini tanlang.</li>
                      <li>Telefonda ilova belgisi paydo bo'ladi va internet sekin bo'lsa ham tez ochiladi!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* iOS (iPhone / iPad) Flow */}
              {mobileOs === 'ios' && (
                <div className="space-y-3 animate-fade-in">
                  <div
                    className={`p-4 rounded-2xl border flex items-center gap-3 ${
                      isDark ? 'bg-[#141b2b] border-sky-500/30' : 'bg-sky-50/50 border-sky-300 shadow-xs'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#0a0d14] border border-sky-500/30 flex items-center justify-center p-1.5 shadow-md shrink-0">
                      <img src="/logo.svg" alt="Worthub" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        <span>iPhone & iPad Ilovasi</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
                          Apple iOS
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Safari orqali App Store'siz bosh ekranga o'rnatiladi
                      </p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="font-bold text-sky-400 text-xs flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      <span>iPhone'da o'rnatish (3 oddiy qadam):</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/30 border border-slate-800/80">
                        <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                        <div>
                          <strong className="text-slate-200">Ulashish (Share) tugmasini bosing:</strong>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Safari brauzerining pastki qismidagi kvadrat ustida yuqoriga qaragan strelka belgisini bosing.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/30 border border-slate-800/80">
                        <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                        <div>
                          <strong className="text-slate-200">"Bosh ekranga qo'shish" ni tanlang:</strong>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Ochilgan menyuni pastga suring va <strong>"Add to Home Screen" (+)</strong> bandini bosing.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/30 border border-slate-800/80">
                        <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                        <div>
                          <strong className="text-slate-200">"Qo'shish" (Add) tugmasini bosing:</strong>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Yuqori o'ng burchakdagi "Add" tugmasini bosing. Ilova bosh ekranda paydo bo'ladi!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'border-slate-800 bg-[#0c101a]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Worthub xavfsiz va sertifikatlangan PWA ilovasi</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isInstallable && (
              <button
                type="button"
                onClick={handleDirectInstall}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Hoziroq O'rnatish</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {language === 'ru' ? 'Закрыть' : language === 'en' ? 'Close' : 'Tushundim, yopish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;
