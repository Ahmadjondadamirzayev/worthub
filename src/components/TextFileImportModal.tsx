import React, { useState } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
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
  german: string;
  article: GermanArticle;
  uzbek: string;
  plural?: string;
  partOfSpeech: PartOfSpeech;
  level: CefrLevel;
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
  const isDark = theme === 'dark';
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    defaultLessonId || lessons[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [defaultLevel, setDefaultLevel] = useState<CefrLevel>('A1');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [errorLines, setErrorLines] = useState<number>(0);

  if (!isOpen) return null;

  // Auto-parse text when input changes
  const handleParseText = (text: string) => {
    setInputText(text);
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#'));

    const rows: ParsedRow[] = [];
    let errors = 0;

    lines.forEach((line) => {
      // Try semicolon, hyphen, slash, or tab
      let parts: string[] = [];
      if (line.includes(';')) {
        parts = line.split(';').map((p) => p.trim());
      } else if (line.includes(' - ')) {
        parts = line.split(' - ').map((p) => p.trim());
      } else if (line.includes('/')) {
        parts = line.split('/').map((p) => p.trim());
      } else if (line.includes('\t')) {
        parts = line.split('\t').map((p) => p.trim());
      } else if (line.includes(',')) {
        parts = line.split(',').map((p) => p.trim());
      } else {
        // Space separated fallback: article word - uzbek
        const match = line.match(/^(der|die|das)?\s*([^\-]+)\s*[\-:]\s*(.+)$/i);
        if (match) {
          parts = [match[1] || 'none', match[2].trim(), match[3].trim()];
        }
      }

      if (parts.length >= 2) {
        let article: GermanArticle = 'none';
        let german = '';
        let uzbek = '';
        let plural: string | undefined = undefined;
        let level: CefrLevel = defaultLevel;
        let partOfSpeech: PartOfSpeech = 'noun';
        let exampleDe: string | undefined = undefined;
        let exampleUz: string | undefined = undefined;

        // Check if first part contains article, e.g. "der Apfel"
        const firstToken = parts[0];
        const lowerFirst = firstToken.toLowerCase();

        if (lowerFirst.startsWith('der ')) {
          article = 'der';
          german = firstToken.slice(4).trim();
          uzbek = parts[1];
          if (parts[2]) plural = parts[2];
          if (parts[3] && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(parts[3].toUpperCase())) {
            level = parts[3].toUpperCase() as CefrLevel;
          }
        } else if (lowerFirst.startsWith('die ')) {
          article = 'die';
          german = firstToken.slice(4).trim();
          uzbek = parts[1];
          if (parts[2]) plural = parts[2];
          if (parts[3] && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(parts[3].toUpperCase())) {
            level = parts[3].toUpperCase() as CefrLevel;
          }
        } else if (lowerFirst.startsWith('das ')) {
          article = 'das';
          german = firstToken.slice(4).trim();
          uzbek = parts[1];
          if (parts[2]) plural = parts[2];
          if (parts[3] && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(parts[3].toUpperCase())) {
            level = parts[3].toUpperCase() as CefrLevel;
          }
        } else if (['der', 'die', 'das', 'none'].includes(lowerFirst)) {
          // Format: article; word; uzbek; plural
          article = lowerFirst as GermanArticle;
          german = parts[1];
          uzbek = parts[2] || '';
          plural = parts[3];
          if (parts[4] && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(parts[4].toUpperCase())) {
            level = parts[4].toUpperCase() as CefrLevel;
          }
        } else {
          // No explicit leading article
          german = parts[0];
          uzbek = parts[1];
          if (parts[2] && ['der', 'die', 'das', 'none'].includes(parts[2].toLowerCase())) {
            article = parts[2].toLowerCase() as GermanArticle;
          }
          if (parts[3]) plural = parts[3];
          if (parts[4] && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(parts[4].toUpperCase())) {
            level = parts[4].toUpperCase() as CefrLevel;
          }
        }

        // Detect part of speech
        if (article !== 'none') {
          partOfSpeech = 'noun';
        } else if (german.endsWith('en') || german.endsWith('eln') || german.endsWith('ern')) {
          partOfSpeech = 'verb';
        } else if (german.includes(' ')) {
          partOfSpeech = 'phrase';
        } else {
          partOfSpeech = 'adjective';
        }

        if (german && uzbek) {
          rows.push({
            german,
            article,
            uzbek,
            plural,
            partOfSpeech,
            level,
            exampleDe,
            exampleUz,
          });
        } else {
          errors++;
        }
      } else {
        errors++;
      }
    });

    setParsedRows(rows);
    setErrorLines(errors);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleParseText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sample = `# Namunaviy import formati (Har bir qator bitta so'z):
der Tisch - stol - die Tische - A1
die Lampe - chiroq, lampa - die Lampen - A1
das Fenster - deraza - die Fenster - A1
arbeiten - ishlamoq - A1
glücklich - baxtli, xursand - A2
das Geheimnis - sir, maxfiylik - die Geheimnisse - B1
zur Verfügung stehen - ixtiyorida bo'lmoq - B2
die Nachhaltigkeit - barqarorlik - C1`;

    handleParseText(sample);
  };

  const handleImportSubmit = () => {
    if (parsedRows.length === 0 || !selectedLessonId) return;

    const today = new Date().toISOString().slice(0, 10);
    const newWords: WordItem[] = parsedRows.map((r, idx) => ({
      id: `w-imp-${Date.now()}-${idx}`,
      setId: selectedLessonId,
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
    }));

    onImportWords(newWords);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
        isDark ? 'border-slate-800 bg-[#0f172a] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <WorthubLogo size="sm" variant="mark-only" theme={theme} />
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Matnli fayldan so'zlarni yuklash (Text File Import)
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Matnli faylni (.txt, .csv) yuklang yoki matnni to'g'ridan-to'g'ri joylashtiring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Target Lesson Selector & Default Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Qaysi darsga (Lektion) yuklanadi? *
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white'
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
                Standart daraja (agar ko'rsatilmagan bo'lsa)
              </label>
              <select
                value={defaultLevel}
                onChange={(e) => setDefaultLevel(e.target.value as CefrLevel)}
                className={`w-full rounded-xl px-3 py-2 font-mono transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white'
                }`}
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          {/* Upload or Sample button */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer border text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}>
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>.txt / .csv faylni tanlash</span>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleLoadSample}
              className={`text-xs underline font-semibold cursor-pointer ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'
              }`}
            >
              Namunaviy matnni kiritish
            </button>
          </div>

          {/* Text Area */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Matnni shu yerga joylashtiring (har bir qatorda: nemischa - o'zbekcha):
            </label>
            <textarea
              rows={5}
              placeholder="der Tisch - stol - die Tische&#10;die Lampe - chiroq - die Lampen&#10;arbeiten - ishlamoq - A1"
              value={inputText}
              onChange={(e) => handleParseText(e.target.value)}
              className={`w-full rounded-xl p-3 font-mono text-xs transition-colors border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Parsed Live Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Muvaffaqiyatli aniqlangan so'zlar: {parsedRows.length} ta</span>
                </span>
                {errorLines > 0 && (
                  <span className="text-amber-500 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorLines} ta qator o'tkazib yuborildi</span>
                  </span>
                )}
              </div>

              <div className={`max-h-48 overflow-y-auto rounded-xl border ${
                isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
              }`}>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-mono ${
                      isDark ? 'border-slate-800 text-slate-400 bg-slate-900' : 'border-slate-200 text-slate-600 bg-slate-100'
                    }`}>
                      <th className="py-2 px-3">Artikl</th>
                      <th className="py-2 px-3">Nemischa</th>
                      <th className="py-2 px-3">O'zbekcha</th>
                      <th className="py-2 px-3">Ko'plik</th>
                      <th className="py-2 px-3">Daraja</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                    {parsedRows.slice(0, 50).map((row, i) => (
                      <tr key={i} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100/70'}>
                        <td className="py-1.5 px-3">
                          <span className={ARTICLE_COLORS[row.article].text}>
                            {row.article}
                          </span>
                        </td>
                        <td className={`py-1.5 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {row.german}
                        </td>
                        <td className={`py-1.5 px-3 ${isDark ? 'text-amber-300' : 'text-amber-700 font-semibold'}`}>
                          {row.uzbek}
                        </td>
                        <td className={`py-1.5 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {row.plural || '-'}
                        </td>
                        <td className={`py-1.5 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {row.level}
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
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {parsedRows.length > 0 ? `${parsedRows.length} ta so'z yuklashga tayyor` : 'Matn kiriting'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={handleImportSubmit}
              className="px-5 py-2.5 text-xs bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-600/20"
            >
              Hammasini bazaga yuklash ({parsedRows.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
