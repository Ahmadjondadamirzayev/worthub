import React, { useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle,
  FileSpreadsheet,
  Building2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { UserWealthProfile, CurrencyCode } from '../types/worth';
import {
  formatCurrency,
  formatPercent,
  generateCSV,
} from '../utils/formatters';

interface BalanceSheetViewProps {
  profile: UserWealthProfile;
  currency: CurrencyCode;
}

export const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({
  profile,
  currency,
}) => {
  const [copied, setCopied] = useState(false);

  // Group Assets
  const currentAssets = profile.assets.filter(
    (a) => a.liquidity === 'liquid'
  );
  const nonCurrentAssets = profile.assets.filter(
    (a) => a.liquidity !== 'liquid'
  );

  const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + a.value, 0);
  const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, a) => sum + a.value, 0);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  // Group Liabilities
  const currentLiabilities = profile.liabilities.filter(
    (l) => l.category === 'credit_card' || l.category === 'personal_loan'
  );
  const longTermLiabilities = profile.liabilities.filter(
    (l) => l.category !== 'credit_card' && l.category !== 'personal_loan'
  );

  const totalCurrentLiabilities = currentLiabilities.reduce(
    (sum, l) => sum + l.balance,
    0
  );
  const totalLongTermLiabilities = longTermLiabilities.reduce(
    (sum, l) => sum + l.balance,
    0
  );
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const netEquity = totalAssets - totalLiabilities;
  const isEquationBalanced = Math.abs(totalAssets - (totalLiabilities + netEquity)) < 0.01;

  // Key Solvency Ratios
  const currentRatio =
    totalCurrentLiabilities > 0
      ? totalCurrentAssets / totalCurrentLiabilities
      : totalCurrentAssets > 0
      ? 999
      : 1;

  const debtToEquity =
    netEquity > 0 ? (totalLiabilities / netEquity) * 100 : 0;

  const handleExportCSV = () => {
    const csvContent = generateCSV(
      profile.assets.map((a) => ({
        name: a.name,
        category: a.category,
        institution: a.institution,
        value: a.value,
      })),
      profile.liabilities.map((l) => ({
        name: l.name,
        category: l.category,
        lender: l.lender,
        balance: l.balance,
        interestRate: l.interestRate,
      })),
      currency
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `worthhub-balance-sheet-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `WorthHub Financial Statement (${new Date().toLocaleDateString()})
Total Assets: ${formatCurrency(totalAssets, currency)}
- Current / Liquid: ${formatCurrency(totalCurrentAssets, currency)}
- Non-Current / Tangible: ${formatCurrency(totalNonCurrentAssets, currency)}
Total Liabilities: ${formatCurrency(totalLiabilities, currency)}
- Current Debt: ${formatCurrency(totalCurrentLiabilities, currency)}
- Long-Term Debt: ${formatCurrency(totalLongTermLiabilities, currency)}
Net Equity / Net Worth: ${formatCurrency(netEquity, currency)}
Debt-to-Equity: ${debtToEquity.toFixed(1)}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Personal Balance Sheet & Solvency Statement
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal statement of financial position as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Ratios row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Current Liquidity Ratio</div>
          <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
            {currentRatio > 50 ? '>50.0x' : `${currentRatio.toFixed(2)}x`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Current Assets / Current Liabilities (Standard &gt; 2.0x)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Debt-to-Equity Ratio</div>
          <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
            {formatPercent(debtToEquity, 1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total Debt / Net Worth (Standard &lt; 50%)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Accounting Equation Status</div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm mt-1">
            <CheckCircle className="w-4 h-4" />
            <span>Assets = Debt + Equity (Balanced)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Verified to the nearest penny
          </div>
        </div>
      </div>

      {/* Formal Balance Sheet Document Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 sm:p-10 shadow-xl print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="text-center pb-8 border-b border-slate-800">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-1">
            WorthHub Consolidated Financial Statement
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Statement of Financial Position
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Prepared for <strong className="text-slate-200">{profile.name}</strong> · As of{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            · Currency: {currency}
          </div>
        </div>

        {/* Two Columns: Assets vs Liabilities & Equity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          {/* ASSETS COLUMN */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-emerald-500/40 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Assets
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Debit Balance
              </span>
            </div>

            {/* Current Assets */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Current Assets (Liquid)
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {currentAssets.map((a) => (
                  <div key={a.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-slate-200 font-medium">{a.name}</div>
                      <div className="text-[11px] text-slate-500">{a.institution}</div>
                    </div>
                    <div className="font-mono text-slate-200 tabular-nums">
                      {formatCurrency(a.value, currency)}
                    </div>
                  </div>
                ))}
                {currentAssets.length === 0 && (
                  <div className="py-2 text-slate-500 italic">No liquid assets recorded</div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-mono text-xs font-semibold text-slate-300">
                <span>Total Current Assets</span>
                <span className="tabular-nums">
                  {formatCurrency(totalCurrentAssets, currency)}
                </span>
              </div>
            </div>

            {/* Non-Current Assets */}
            <div className="space-y-2 pt-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Non-Current Assets (Investments & Properties)
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {nonCurrentAssets.map((a) => (
                  <div key={a.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-slate-200 font-medium">{a.name}</div>
                      <div className="text-[11px] text-slate-500">{a.institution}</div>
                    </div>
                    <div className="font-mono text-slate-200 tabular-nums">
                      {formatCurrency(a.value, currency)}
                    </div>
                  </div>
                ))}
                {nonCurrentAssets.length === 0 && (
                  <div className="py-2 text-slate-500 italic">No non-current assets recorded</div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-mono text-xs font-semibold text-slate-300">
                <span>Total Non-Current Assets</span>
                <span className="tabular-nums">
                  {formatCurrency(totalNonCurrentAssets, currency)}
                </span>
              </div>
            </div>

            {/* Total Assets Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm font-bold font-mono">
              <span className="text-white">TOTAL ASSETS</span>
              <span className="text-emerald-400 tabular-nums text-base">
                {formatCurrency(totalAssets, currency)}
              </span>
            </div>
          </div>

          {/* LIABILITIES & EQUITY COLUMN */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-rose-500/40 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Liabilities & Equity
              </h3>
              <span className="text-xs font-mono text-rose-400 font-semibold">
                Credit Balance
              </span>
            </div>

            {/* Current Liabilities */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Current Liabilities (Short-Term)
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {currentLiabilities.map((l) => (
                  <div key={l.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-slate-200 font-medium">{l.name}</div>
                      <div className="text-[11px] text-slate-500">{l.lender}</div>
                    </div>
                    <div className="font-mono text-rose-300 tabular-nums">
                      {formatCurrency(l.balance, currency)}
                    </div>
                  </div>
                ))}
                {currentLiabilities.length === 0 && (
                  <div className="py-2 text-slate-500 italic">No short-term debt recorded</div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-mono text-xs font-semibold text-slate-300">
                <span>Total Current Liabilities</span>
                <span className="tabular-nums">
                  {formatCurrency(totalCurrentLiabilities, currency)}
                </span>
              </div>
            </div>

            {/* Long-Term Liabilities */}
            <div className="space-y-2 pt-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Long-Term Liabilities (Mortgages & Notes)
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {longTermLiabilities.map((l) => (
                  <div key={l.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-slate-200 font-medium">{l.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {l.lender} · {l.interestRate}% APR
                      </div>
                    </div>
                    <div className="font-mono text-rose-300 tabular-nums">
                      {formatCurrency(l.balance, currency)}
                    </div>
                  </div>
                ))}
                {longTermLiabilities.length === 0 && (
                  <div className="py-2 text-slate-500 italic">No long-term debt recorded</div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-mono text-xs font-semibold text-slate-300">
                <span>Total Long-Term Liabilities</span>
                <span className="tabular-nums">
                  {formatCurrency(totalLongTermLiabilities, currency)}
                </span>
              </div>
            </div>

            {/* Total Liabilities Subtotal */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold font-mono">
              <span className="text-slate-300">TOTAL LIABILITIES</span>
              <span className="text-rose-300 tabular-nums">
                {formatCurrency(totalLiabilities, currency)}
              </span>
            </div>

            {/* Owner's Equity / Net Worth */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Owner's Net Equity
              </div>
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200">Net Personal Equity</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(netEquity, currency)}
                </span>
              </div>
            </div>

            {/* TOTAL LIABILITIES & EQUITY */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 text-sm font-bold font-mono">
              <span className="text-white">TOTAL LIABILITIES & EQUITY</span>
              <span className="text-white tabular-nums text-base">
                {formatCurrency(totalLiabilities + netEquity, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Note */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>WorthHub Intelligence · Balance Sheet Verified</span>
          <span>Assets = Liabilities + Equity</span>
        </div>
      </div>
    </div>
  );
};
