import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../utils/i18n';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'compact' | 'segmented';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    SUPPORTED_LANGUAGES.find((opt) => opt.code === language) || SUPPORTED_LANGUAGES[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner ${className}`}
        role="group"
        aria-label="Language selector"
      >
        {SUPPORTED_LANGUAGES.map((opt) => {
          const isActive = language === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="text-sm leading-none">{opt.flag}</span>
              <span>{opt.nativeName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
          isOpen
            ? 'bg-slate-800 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/20'
            : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600 text-slate-200'
        }`}
        title="Sayt tilini tanlash / Выбрать язык / Select language"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentOption.flag}</span>
        <span className="font-bold tracking-wide">
          {variant === 'compact' ? currentOption.code.toUpperCase() : currentOption.nativeName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-[#0f1420] border border-slate-700/90 shadow-2xl py-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          <div className="px-3 py-1.5 border-b border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-amber-400" />
              Sayt tili / Язык
            </span>
          </div>

          {SUPPORTED_LANGUAGES.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-300 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{opt.flag}</span>
                  <div className="flex flex-col">
                    <span className="leading-tight">{opt.nativeName}</span>
                    <span className="text-[10px] text-slate-500">{opt.name}</span>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
