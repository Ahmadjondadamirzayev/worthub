import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Trash2,
  BookOpen,
  Layers,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import {
  WordItem,
  VocabularyLesson,
  GermanArticle,
  PartOfSpeech,
  CefrLevel,
  UserAccount,
} from '../types/german';
import { ARTICLE_COLORS } from '../utils/germanGrammar';
import { WorthubLogo } from './WorthubLogo';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { useLanguage } from '../utils/i18n';

interface TextFileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: VocabularyLesson[];
  defaultLessonId?: string;
  currentUser: UserAccount;
  theme?: 'dark' | 'light';
  onImportWords: (words: WordItem[]) => void;
}

interface ParsedRow {
  id: string;
  german: string;
  article: GermanArticle;
  uzbek: string;
  plural?: string;
  partOfSpeech: PartOfSpeech;
  level: CefrLevel;
  targetLessonId?: string;
  exampleDe?: string;
  exampleUz?: string;
}

export const TextFileImportModal: React.FC<TextFileImportModalProps> = ({
  isOpen,
  onClose,
  lessons,
  defaultLessonId,
  currentUser,
  theme = 'dark',
  onImportWords,
}) => {
  const { t, language } = useLanguage();
  const isDark = theme === 'dark';

  // Target lesson ID
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    defaultLessonId || lessons[0]?.id || 'lek-1'
  );

  // Parsing mode: 'vertical' (pastma-past), 'horizontal' (yonma-yon), 'auto'
  const [parseMode, setParseMode] = useState<'vertical' | 'horizontal' | 'auto'>('vertical');
  const [autoDistributeLessons, setAutoDistributeLessons] = useState<boolean>(true);

  const [inputText, setInputText] = useState('');
  const [defaultLevel, setDefaultLevel] = useState<CefrLevel>('A1');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractedFileName, setExtractedFileName] = useState<string | null>(null);

  // Sync selectedLessonId when defaultLessonId or isOpen changes
  useEffect(() => {
    if (defaultLessonId) {
      setSelectedLessonId(defaultLessonId);
    } else if (lessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [defaultLessonId, isOpen, lessons]);

  if (!isOpen) return null;

  // Clean and parse text into structured word rows
  const parseContent = (text: string, mode: 'vertical' | 'horizontal' | 'auto' = parseMode) => {
    const rawLines = text.split('\n').map((l) => l.trim());
    const validLines: Array<{ text: string; lessonTag?: string }> = [];

    let currentLessonTag: string | undefined = undefined;

    for (const line of rawLines) {
      if (!line || line.startsWith('#')) continue;

      // Check if line indicates a lesson header (e.g. "Lektion 1", "=== Lektion 2 ===")
      const lekMatch = line.match(/(?:===|\*\*\*|---)?\s*Lektion\s+(\d+)/i);
      if (lekMatch) {
        const num = parseInt(lekMatch[1], 10);
        const found = lessons.find((l) => l.lektionNumber === num);
        if (found) {
          currentLessonTag = found.id;
        }
        continue;
      }

      validLines.push({ text: line, lessonTag: currentLessonTag });
    }

    if (validLines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Determine vertical vs horizontal
    let useVertical = mode === 'vertical';
    if (mode === 'auto') {
      const delimiterCount = validLines.filter((l) =>
        /[\t]|\s+-\s+|\s+—\s+|\s+\|\s+|;/.test(l.text)
      ).length;
      useVertical = delimiterCount < validLines.length * 0.35;
    }

    const intermediatePairs: Array<{
      germanRaw: string;
      uzbekRaw: string;
      lessonId?: string;
    }> = [];

    if (useVertical) {
      // VERTICAL: Line 1 = German + brackets/symbols, Line 2 = Uzbek underneath
      let i = 0;
      while (i < validLines.length) {
        const item1 = validLines[i];
        const line1 = item1.text;

        // If line1 happens to have an explicit tab or ' - ' delimiter, treat as single line
        if (line1.includes('\t') || line1.includes(' - ') || line1.includes(' | ')) {
          const parts = line1.split(/[\t]|\s+-\s+|\s+\|\s+/).map((p) => p.trim());
          intermediatePairs.push({
            germanRaw: parts[0] || '',
            uzbekRaw: parts.slice(1).join(' / ') || 'Tarjima kiritilmagan',
            lessonId: item1.lessonTag,
          });
          i++;
        } else if (i + 1 < validLines.length) {
          const item2 = validLines[i + 1];
          intermediatePairs.push({
            germanRaw: line1,
            uzbekRaw: item2.text,
            lessonId: item1.lessonTag || item2.lessonTag,
          });
          i += 2;
        } else {
          // Odd line at the end
          intermediatePairs.push({
            germanRaw: line1,
            uzbekRaw: 'Tarjima kiritilmagan',
            lessonId: item1.lessonTag,
          });
          i++;
        }
      }
    } else {
      // HORIZONTAL: German and Uzbek on the same line
      for (const item of validLines) {
        const line = item.text;
        let parts: string[] = [];

        if (line.includes('\t')) {
          parts = line.split('\t').map((p) => p.trim()).filter(Boolean);
        } else if (line.includes(' | ')) {
          parts = line.split(' | ').map((p) => p.trim()).filter(Boolean);
        } else if (line.includes(' - ')) {
          parts = line.split(' - ').map((p) => p.trim()).filter(Boolean);
        } else if (line.includes(' — ')) {
          parts = line.split(' — ').map((p) => p.trim()).filter(Boolean);
        } else if (line.includes(';')) {
          parts = line.split(';').map((p) => p.trim()).filter(Boolean);
        } else {
          parts = [line, 'Tarjima kiritilmagan'];
        }

        intermediatePairs.push({
          germanRaw: parts[0] || '',
          uzbekRaw: parts.slice(1).join(' / ') || 'Tarjima kiritilmagan',
          lessonId: item.lessonTag,
        });
      }
    }

    // Now refine German grammar, articles, plurals, and parts of speech
    const finalRows: ParsedRow[] = intermediatePairs.map((pair, idx) => {
      let rawDe = pair.germanRaw.trim();
      let rawUz = pair.uzbekRaw.trim();
      let article: GermanArticle = 'none';
      let plural: string | undefined = undefined;
      let partOfSpeech: PartOfSpeech = 'phrase';

      // 1. Article detection (der, die, das, (der), (die), (das), der/die)
      const artMatch = rawDe.match(/^(?:\(?\s*(der|die|das)\s*\)?)\s+(.*)$/i);
      if (artMatch) {
        article = artMatch[1].toLowerCase() as GermanArticle;
        let rest = artMatch[2].trim();
        partOfSpeech = 'noun';

        // Extract plural notation: ", -en", ", ¨-er", ", -e", ", -s", "(-en)", "(-e)"
        const plMatch = rest.match(/(?:,|\()\s*([¨\-\w/]+)\s*\)?$/);
        if (plMatch && (plMatch[1].includes('-') || plMatch[1].includes('¨') || plMatch[1].includes('/'))) {
          plural = plMatch[1];
          rest = rest.slice(0, plMatch.index).trim().replace(/,+$/, '').trim();
        }
        rawDe = rest;
      } else {
        // Check for plural in parentheses at end even without article
        const plMatch = rawDe.match(/(?:,|\()\s*([¨\-\w/]+)\s*\)?$/);
        if (plMatch && (plMatch[1].includes('-') || plMatch[1].includes('¨'))) {
          plural = plMatch[1];
          rawDe = rawDe.slice(0, plMatch.index).trim().replace(/,+$/, '').trim();
        }

        // Determine part of speech
        if (rawDe.endsWith('en') && !rawDe.includes(' ')) {
          partOfSpeech = 'verb';
        } else if (rawDe.includes(' ') || rawDe.includes('!')) {
          partOfSpeech = 'phrase';
        } else if (['wie', 'wo', 'wann', 'warum', 'wer', 'was', 'wie viel'].includes(rawDe.toLowerCase())) {
          partOfSpeech = 'adverb';
        } else if (['ich', 'du', 'er', 'es', 'sie', 'wir', 'ihr'].some((p) => rawDe.toLowerCase().includes(p))) {
          partOfSpeech = 'pronoun';
        } else {
          partOfSpeech = 'adjective';
        }
      }

      // Clean up brackets or symbols if empty
      rawDe = rawDe.replace(/^孔/, '').trim();

      return {
        id: `temp-${Date.now()}-${idx}`,
        german: rawDe,
        article,
        plural,
        uzbek: rawUz || 'Tarjima kiritilmagan',
        partOfSpeech,
        level: defaultLevel,
        targetLessonId: autoDistributeLessons && pair.lessonId ? pair.lessonId : selectedLessonId,
      };
    });

    setParsedRows(finalRows);
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    parseContent(text, parseMode);
  };

  const handleModeChange = (newMode: 'vertical' | 'horizontal' | 'auto') => {
    setParseMode(newMode);
    parseContent(inputText, newMode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractedFileName(file.name);

    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      setIsExtractingPdf(true);
      try {
        const text = await extractTextFromPdf(file);
        setInputText(text);
        // By default parse in vertical mode for PDFs
        parseContent(text, 'vertical');
      } catch (err) {
        console.error('PDF error:', err);
      } finally {
        setIsExtractingPdf(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInputText(content);
          parseContent(content, parseMode);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    const sample = `wie
qanday
heißt (heißen)
nomlanadi / ataladi (atalmoq)
ich
men
du
sen
er / es / sie
u (erkak) / u (narsa) / u (ayol)
der Tisch, -e
stol
die Tasche, -n
sumka, xalta
das Buch, ¨-er
kitob
arbeiten (gearbeitet)
ishlamoq
Guten Tag!
Xayrli kun!`;

    setInputText(sample);
    setParseMode('vertical');
    parseContent(sample, 'vertical');
  };

  const handleDeleteRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRowField = (index: number, field: keyof ParsedRow, val: any) => {
    setParsedRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row))
    );
  };

  const handleImportSubmit = () => {
    if (parsedRows.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const newWords: WordItem[] = parsedRows.map((r, idx) => ({
      id: `w-imp-${Date.now()}-${idx}`,
      setId: r.targetLessonId || selectedLessonId || lessons[0]?.id || 'lek-1',
      german: r.german,
      article: r.article,
      plural: r.plural,
      uzbek: r.uzbek,
      partOfSpeech: r.partOfSpeech,
      level: r.level,
      exampleSentenceDe: r.exampleDe,
      exampleSentenceUz: r.exampleUz,
      masteryScore: 0,
      isStarred: false,
      addedBy: currentUser.id,
      createdAt: today,
      isActive: true,
    }));

    onImportWords(newWords);
    onClose();
  };

  const currentTargetLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
    >
      <div className={`relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden max-h-[94vh] flex flex-col transition-colors ${
        isDark ? 'border-slate-800 bg-[#0c101a] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800/80 bg-[#101524]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <WorthubLogo size="sm" variant="mark-only" theme={theme} />
            <div>
              <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                So'zlarni Import Qilish (PDF, TXT, Ro'yxat)
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Nemischa tepada, o'zbekcha tarjimasi tagidan yozilgan PDF va ro'yxatlarni avtomatik o'qiydi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Format Mode Selector */}
          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#141926] border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Matn tuzilishi formati:</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleModeChange('vertical')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                    parseMode === 'vertical'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pastma-past format (PDF uchun)
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('horizontal')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                    parseMode === 'horizontal'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Yonma-yon (Tire / Tab)
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('auto')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                    parseMode === 'auto'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Avtomatik
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {parseMode === 'vertical' && (
                <span className="text-amber-300">
                  ✓ <strong>Pastma-past format:</strong> 1-qatorda nemischa so'z (artikl, qavslar, qo'shimchalar bilan), 2-qatorda uning o'zbekcha tarjimasi yoziladi.
                </span>
              )}
              {parseMode === 'horizontal' && (
                <span>
                  ✓ <strong>Yonma-yon format:</strong> Har bir qatorda bitta so'z va uning tarjimasi tire (<code className="text-amber-300">-</code>) yoki Tab bilan ajratilgan.
                </span>
              )}
              {parseMode === 'auto' && (
                <span>
                  ✓ <strong>Avtomatik format:</strong> Tizim qatorlar tuzilishini tahlil qilib o'zi eng to'g'ri rejimni tanlaydi.
                </span>
              )}
            </p>
          </div>

          {/* Target Lesson & Level Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Qaysi Lektionga yuklansin? *
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => {
                  setSelectedLessonId(e.target.value);
                  setParsedRows((prev) =>
                    prev.map((r) => ({ ...r, targetLessonId: e.target.value }))
                  );
                }}
                className={`w-full rounded-xl px-3 py-2 transition-colors border font-semibold ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500'
                }`}
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Standart CEFR darajasi:
              </label>
              <select
                value={defaultLevel}
                onChange={(e) => {
                  const lvl = e.target.value as CefrLevel;
                  setDefaultLevel(lvl);
                  setParsedRows((prev) => prev.map((r) => ({ ...r, level: lvl })));
                }}
                className={`w-full rounded-xl px-3 py-2 font-mono transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500'
                }`}
              >
                <option value="A1">A1 — Boshlang'ich</option>
                <option value="A2">A2 — Elementar</option>
                <option value="B1">B1 — O'rta</option>
                <option value="B2">B2 — Yuqori o'rta</option>
                <option value="C1">C1 — Ilg'or</option>
              </select>
            </div>
          </div>

          {/* File Upload Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <label className={`flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer border text-xs font-bold transition-all shadow-sm ${
                isDark
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-200 border-amber-500/40'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {isExtractingPdf ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {isExtractingPdf
                    ? "PDF fayl o'qilmoqda..."
                    : extractedFileName
                    ? `Fayl tanlandi: ${extractedFileName}`
                    : "📁 PDF yoki Matn faylini yuklash (.pdf, .txt)"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.txt,.csv,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isExtractingPdf}
                  className="hidden"
                />
              </label>

              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setParsedRows([]);
                    setExtractedFileName(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer"
                  title="Matnni tozalash"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tozalash</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              className={`text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Namunaviy formatni ko'rish</span>
            </button>
          </div>

          {/* Textarea */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Matn kiritish yoki PDF dan o'qilgan matn:
            </label>
            <textarea
              rows={5}
              placeholder={`wie\nqanday\nheißt (heißen)\nnomlanadi / ataladi (atalmoq)\nder Tisch, -e\nstol\ndie Tasche, -n\nsumka`}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              className={`w-full rounded-xl p-3 font-mono text-xs transition-colors border leading-relaxed ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Parsed Live Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Aniqlangan so'zlar: <strong className="text-amber-400 text-sm">{parsedRows.length} ta</strong>
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">
                    Yuklanadigan dars: <strong className="text-white">{currentTargetLesson?.title}</strong>
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  (Quyidagi jadvalda so'zlarni to'g'ridan-to'g'ri tahrirlashingiz mumkin)
                </span>
              </div>

              <div className={`max-h-60 overflow-y-auto rounded-xl border ${
                isDark ? 'border-slate-800 bg-[#0f1422]' : 'border-slate-200 bg-slate-50'
              }`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className={`border-b font-mono ${
                      isDark ? 'border-slate-800 text-slate-400 bg-[#161d30]' : 'border-slate-200 text-slate-600 bg-slate-200'
                    }`}>
                      <th className="py-2 px-2.5 w-10 text-center">#</th>
                      <th className="py-2 px-2.5 w-20">Artikl</th>
                      <th className="py-2 px-2.5">Nemischa so'z</th>
                      <th className="py-2 px-2.5 w-24">Ko'plik</th>
                      <th className="py-2 px-2.5">O'zbekcha ma'nosi</th>
                      <th className="py-2 px-2.5 w-16 text-center">Daraja</th>
                      <th className="py-2 px-2.5 w-12 text-center">O'chirish</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                    {parsedRows.map((row, i) => (
                      <tr key={row.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100/80'}>
                        <td className="py-1.5 px-2.5 text-center text-slate-500 text-[11px]">
                          {i + 1}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <select
                            value={row.article}
                            onChange={(e) => handleUpdateRowField(i, 'article', e.target.value)}
                            className={`rounded px-1.5 py-0.5 text-[11px] font-bold border border-transparent focus:border-amber-400 outline-none ${
                              row.article === 'der'
                                ? 'bg-blue-500/20 text-blue-300'
                                : row.article === 'die'
                                ? 'bg-rose-500/20 text-rose-300'
                                : row.article === 'das'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <option value="none">-</option>
                            <option value="der">der</option>
                            <option value="die">die</option>
                            <option value="das">das</option>
                          </select>
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            value={row.german}
                            onChange={(e) => handleUpdateRowField(i, 'german', e.target.value)}
                            className={`w-full bg-transparent font-bold border-b border-transparent hover:border-slate-700 focus:border-amber-400 outline-none px-1 py-0.5 ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          />
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            placeholder="-"
                            value={row.plural || ''}
                            onChange={(e) => handleUpdateRowField(i, 'plural', e.target.value)}
                            className={`w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-400 outline-none px-1 py-0.5 text-slate-400`}
                          />
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            value={row.uzbek}
                            onChange={(e) => handleUpdateRowField(i, 'uzbek', e.target.value)}
                            className={`w-full bg-transparent font-medium border-b border-transparent hover:border-slate-700 focus:border-amber-400 outline-none px-1 py-0.5 ${
                              isDark ? 'text-amber-300' : 'text-amber-800'
                            }`}
                          />
                        </td>
                        <td className="py-1.5 px-2.5 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                            {row.level}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(i)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between flex-wrap gap-3 ${
          isDark ? 'border-slate-800/80 bg-[#101524]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {parsedRows.length > 0 ? (
                <span>
                  Yuklanmoqda: <strong className="text-amber-400">{parsedRows.length} ta so'z</strong> ➡️ <strong className="text-emerald-400">{currentTargetLesson?.title}</strong>
                </span>
              ) : (
                'Matn kiriting yoki fayl tanlang'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={handleImportSubmit}
              className="px-6 py-2.5 text-xs bg-gradient-to-r from-emerald-600 via-amber-600 to-orange-500 hover:opacity-95 text-white font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Darsga qo'shish ({parsedRows.length} ta so'z)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
