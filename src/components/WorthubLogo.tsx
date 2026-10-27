import React from 'react';

interface WorthubLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark-only' | 'compact' | 'seal';
  theme?: 'dark' | 'light';
  className?: string;
}

export const WorthubLogo: React.FC<WorthubLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  // Mark dimensions
  const markDimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  // Text dimensions
  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }[size];

  const dotUzSize = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-0.5',
    xl: 'text-base px-3 py-1',
  }[size];

  // SVG Mark: O'zbekiston IIB va DXX gerblari andozasidagi salobatli Qalqon, Qilich va Davlat yulduzi nishoni
  const LogoMark = (
    <div className={`relative ${markDimensions} shrink-0 group select-none`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* IIB / DXX uslubidagi zarhal oltin gradiyenti */}
          <linearGradient id="iibGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7AA" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Yorqin zarhal oltin */}
          <linearGradient id="iibBrightGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Po'lat qilich tig'i (Steel blade) */}
          <linearGradient id="iibSteel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Qalqonning ichki salobatli to'q ko'k / grafit foni */}
          <radialGradient id="iibShieldDisc" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0B2545" />
            <stop offset="50%" stopColor="#06162B" />
            <stop offset="90%" stopColor="#030A14" />
            <stop offset="100%" stopColor="#02060D" />
          </radialGradient>

          {/* Yoqut qizil tosh jilosi */}
          <linearGradient id="iibRuby" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D6D" />
            <stop offset="60%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Oltin nurlanish filteri */}
          <filter id="iibGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ============================================================ */}
        {/* 1. IIB / DXX SALOBATLI ADOLAT QILICHI (VERTİKAL QILICH)       */}
        {/* ============================================================ */}
        {/* Qilich dastasi boshidagi zarhal sharcha (Pommel) */}
        <circle cx="50" cy="4.5" r="3" fill="url(#iibGold)" stroke="#FFF7AA" strokeWidth="0.5" />
        <circle cx="50" cy="4.5" r="1.2" fill="url(#iibRuby)" />

        {/* Qilich dastasi (Grip) */}
        <rect x="48.5" y="7" width="3" height="6.5" rx="0.5" fill="url(#iibBrightGold)" stroke="#78350F" strokeWidth="0.4" />
        {/* Dasta o'ramlari */}
        <line x1="48.5" y1="9" x2="51.5" y2="9" stroke="#78350F" strokeWidth="0.6" />
        <line x1="48.5" y1="11.5" x2="51.5" y2="11.5" stroke="#78350F" strokeWidth="0.6" />

        {/* Qilich gardishi (Crossguard) - Qalqon tepasida salobatli turadi */}
        <path
          d="M36 13.5 C42 15 47 14 50 14.5 C53 14 58 15 64 13.5 C62 16.5 56 17 50 17 C44 17 38 16.5 36 13.5 Z"
          fill="url(#iibGold)"
          stroke="#FFF7AA"
          strokeWidth="0.6"
        />
        {/* Gardishdagi yoqut ko'zlar */}
        <circle cx="50" cy="15.5" r="1.3" fill="url(#iibRuby)" />
        <circle cx="41" cy="14.5" r="0.9" fill="url(#iibRuby)" />
        <circle cx="59" cy="14.5" r="0.9" fill="url(#iibRuby)" />

        {/* Qalqon ostidan chiqib turgan Qilich tig'i (Pastki o'tkir uchi) */}
        <path d="M48 84 L50 97 L52 84 Z" fill="url(#iibSteel)" stroke="#94A3B8" strokeWidth="0.5" />
        <line x1="50" y1="84" x2="50" y2="96.5" stroke="#FFFFFF" strokeWidth="0.8" />

        {/* ============================================================ */}
        {/* 2. DAFNA VA EMAN GULCHAMBARI (CHAMBARCHA - IIB/DXX USLUBI)   */}
        {/* ============================================================ */}
        {/* Chapdagi zarhal eman barglari (Kuch va mustahkamlik) */}
        <g fill="url(#iibGold)" stroke="#B45309" strokeWidth="0.3">
          <path d="M18 35 C13 32 12 39 16 42 C14 46 17 51 21 49 C18 54 22 59 25 57 C22 62 26 67 31 65 C28 70 33 74 38 72 Z" opacity="0.9" />
          <path d="M12 45 C15 42 20 46 18 50 Z" />
          <path d="M15 56 C18 53 23 57 20 61 Z" />
          <path d="M19 66 C23 63 28 67 24 72 Z" />
        </g>
        {/* O'ngdagi zarhal dafna barglari (Shon-sharaf va qonun) */}
        <g fill="url(#iibGold)" stroke="#B45309" strokeWidth="0.3">
          <path d="M82 35 C87 32 88 39 84 42 C86 46 83 51 79 49 C82 54 78 59 75 57 C78 62 74 67 69 65 C72 70 67 74 62 72 Z" opacity="0.9" />
          <path d="M88 45 C85 42 80 46 82 50 Z" />
          <path d="M85 56 C82 53 77 57 80 61 Z" />
          <path d="M81 66 C77 63 72 67 76 72 Z" />
        </g>

        {/* ============================================================ */}
        {/* 3. ASOSIY GERB QALQONI (HERALDIC SHIELD)                     */}
        {/* ============================================================ */}
        {/* Qalqonning tashqi zarhal qurolli ramkasi */}
        <path
          d="M50 16.5 L78 22 C78 48 68 73 50 87 C32 73 22 48 22 22 L50 16.5 Z"
          fill="url(#iibShieldDisc)"
          stroke="url(#iibGold)"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Qalqon ichki zarhal hoshiyasi va mudofaa mixlari (Rivets) */}
        <path
          d="M50 20 L74 25 C74 46 65 67 50 80.5 C35 67 26 46 26 25 L50 20 Z"
          stroke="url(#iibBrightGold)"
          strokeWidth="1.2"
          fill="none"
          strokeDasharray="2.5 3"
          opacity="0.85"
        />

        {/* Qalqon yuzasidagi nurlar (Quyosh va adolat nuri) */}
        <circle cx="50" cy="44" r="16" fill="#FDE047" opacity="0.18" filter="url(#iibGlow)" />
        <g stroke="url(#iibBrightGold)" strokeWidth="0.8" opacity="0.45">
          <line x1="50" y1="44" x2="50" y2="28" />
          <line x1="50" y1="44" x2="38" y2="33" />
          <line x1="50" y1="44" x2="62" y2="33" />
          <line x1="50" y1="44" x2="33" y2="42" />
          <line x1="50" y1="44" x2="67" y2="42" />
          <line x1="50" y1="44" x2="36" y2="52" />
          <line x1="50" y1="44" x2="64" y2="52" />
        </g>

        {/* ============================================================ */}
        {/* 4. SAKKIZ QIRRALI DAVLAT YULDUZI (RUB EL-HIZB) VA OY          */}
        {/* ============================================================ */}
        {/* Tashqi kvadrat */}
        <rect x="44.5" y="24" width="11" height="11" rx="0.8" fill="url(#iibGold)" stroke="#FFF7AA" strokeWidth="0.6" />
        {/* 45 daraja burilgan ichki kvadrat */}
        <rect x="44.5" y="24" width="11" height="11" rx="0.8" transform="rotate(45 50 29.5)" fill="url(#iibGold)" stroke="#FFF7AA" strokeWidth="0.6" />
        {/* Yulduz markazidagi oq oy va nurlar */}
        <circle cx="50" cy="29.5" r="2.8" fill="#FFFFFF" />
        <circle cx="50.9" cy="29.2" r="2.2" fill="#06162B" />

        {/* ============================================================ */}
        {/* 5. ILM-MA'RIFAT VA QONUN KITOBI HAMDA 'W' QANOT MONOGRAMMASI */}
        {/* ============================================================ */}
        {/* Qalqon ichidagi Humo qanotlari (Zarhal & Kumush) */}
        <path
          d="M28 42 C32 34 38 31 43 38 L50 48 L57 38 C62 31 68 34 72 42 L66 51 L50 60 L34 51 Z"
          fill="url(#iibGold)"
          opacity="0.95"
        />

        {/* Salobatli Ochiq Kitob (Ilm, lug'at va qonun ramzi) */}
        <path
          d="M50 63 C42 61 33 63 26 67 L26 57 C33 53 42 52 50 55 C58 52 67 53 74 57 L74 67 C67 63 58 61 50 63 Z"
          fill="#F8FAFC"
          stroke="url(#iibGold)"
          strokeWidth="1.2"
        />
        <path
          d="M50 64 L50 69 M26 67 L26 71 C33 67 42 66 50 69 C58 66 67 67 74 71 L74 67"
          stroke="url(#iibBrightGold)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Markaziy 'W' Relyef Monogrammasi (Kuchli va aniq) */}
        <path
          d="M32 37 L39 52 L50 41 L61 52 L68 37"
          stroke="#FFFFFF"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 37 L39 52 L50 41 L61 52 L68 37"
          stroke="url(#iibBrightGold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ============================================================ */}
        {/* 6. ASOSDAGI DAVLAT BAYROG'I VA ZARHAL LENTA                   */}
        {/* ============================================================ */}
        {/* Moviy qatlam */}
        <path
          d="M26 77 C34 81 42 82 50 82 C58 82 66 81 74 77 L75 80 C67 84 59 85 50 85 C41 85 33 84 25 80 Z"
          fill="#0099B5"
        />
        {/* Qizil hoshiyali Oq qatlam */}
        <path
          d="M25 80 C33 84 41 85 50 85 C59 85 67 84 75 80 L76 83 C68 87 59 88 50 88 C41 88 32 87 24 83 Z"
          fill="#FFFFFF"
          stroke="#CE1126"
          strokeWidth="0.4"
        />
        {/* Yashil qatlam */}
        <path
          d="M24 83 C32 87 41 88 50 88 C59 88 68 87 76 83 L77 86 C69 90 60 91 50 91 C40 91 31 90 23 86 Z"
          fill="#1EB53A"
        />

        {/* Lenta oltin cheti va qisqichlari */}
        <path
          d="M22 75 L26 87 L24 88 L20 76 Z M78 75 L74 87 L76 88 L80 76 Z"
          fill="url(#iibGold)"
        />
      </svg>
    </div>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{LogoMark}</div>;
  }

  if (variant === 'seal') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 select-none ${className}`}>
        {LogoMark}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-wider font-serif ${textSize} text-amber-200`}>
              WORTHUB
            </span>
            <span className="rounded font-mono font-black bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-2 py-0.5 text-xs shadow-xs">
              .UZ
            </span>
          </div>
          <span className="text-[10px] tracking-widest font-bold uppercase text-amber-500 mt-0.5">
            O'ZBEKISTON RESPUBLIKASI
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Nemis tili ilmiy-ta'lim portali
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {LogoMark}

      <div className="flex flex-col select-none">
        <div className="flex items-center gap-2 leading-none">
          <span className={`font-black tracking-tight font-sans ${textSize} text-white`}>
            WORTHUB
          </span>
          <span
            className={`rounded-md font-mono font-black bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 text-white shadow-xs border border-sky-400/30 ${dotUzSize}`}
          >
            .UZ
          </span>
        </div>

        {variant === 'full' && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-amber-500">
              O'ZBEKISTON
            </span>
            <span className="text-[9px] text-slate-600">·</span>
            <span className="text-[9px] font-medium tracking-tight text-slate-400">
              Nemis tili portali
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
