import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Flame,
  Snowflake,
  Calculator,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  LiabilityItem,
  LiabilityCategory,
  CurrencyCode,
} from '../types/worth';
import {
  formatCurrency,
  formatPercent,
  LIABILITY_CATEGORY_META,
} from '../utils/formatters';

interface LiabilitiesViewProps {
  liabilities: LiabilityItem[];
  currency: CurrencyCode;
  onAddLiability: () => void;
  onEditLiability: (liability: LiabilityItem) => void;
  onDeleteLiability: (id: string) => void;
  onQuickUpdateBalance: (id: string, newBalance: number) => void;
}

export const LiabilitiesView: React.FC<LiabilitiesViewProps> = ({
  liabilities,
  currency,
  onAddLiability,
  onEditLiability,
  onDeleteLiability,
  onQuickUpdateBalance,
}) => {
  const [payoffStrategy, setPayoffStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [extraPaymentMonthly, setExtraPaymentMonthly] = useState<number>(500);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalanceText, setEditBalanceText] = useState('');

  const totalDebt = liabilities.reduce((sum, item) => sum + item.balance, 0);
  const totalMonthlyMin = liabilities.reduce((sum, item) => sum + item.monthlyPayment, 0);

  // Weighted average interest rate
  const weightedInterestRate =
    totalDebt > 0
      ? liabilities.reduce((sum, item) => sum + item.balance * item.interestRate, 0) /
        totalDebt
      : 0;

  // Payoff acceleration math
  const calculatePayoffSummary = () => {
    if (totalDebt <= 0 || totalMonthlyMin <= 0) {
      return { baselineMonths: 0, acceleratedMonths: 0, interestSaved: 0 };
    }

    const r = weightedInterestRate / 100 / 12;
    // Standard baseline months using amortization formula: n = -ln(1 - r*P/M) / ln(1+r)
    let baselineMonths = 0;
    if (r > 0 && 1 - (r * totalDebt) / totalMonthlyMin > 0) {
      baselineMonths =
        -Math.log(1 - (r * totalDebt) / totalMonthlyMin) / Math.log(1 + r);
    } else {
      baselineMonths = totalDebt / Math.max(totalMonthlyMin, 1);
    }

    const acceleratedMonthly = totalMonthlyMin + extraPaymentMonthly;
    let acceleratedMonths = 0;
    if (r > 0 && 1 - (r * totalDebt) / acceleratedMonthly > 0) {
      acceleratedMonths =
        -Math.log(1 - (r * totalDebt) / acceleratedMonthly) / Math.log(1 + r);
    } else {
      acceleratedMonths = totalDebt / acceleratedMonthly;
    }

    const baselineTotalPaid = totalMonthlyMin * baselineMonths;
    const acceleratedTotalPaid = acceleratedMonthly * acceleratedMonths;
    const interestSaved = Math.max(0, baselineTotalPaid - acceleratedTotalPaid);

    return {
      baselineMonths: Math.round(baselineMonths),
      acceleratedMonths: Math.round(acceleratedMonths),
      interestSaved: Math.round(interestSaved),
    };
  };

  const payoff = calculatePayoffSummary();
  const monthsSaved = Math.max(0, payoff.baselineMonths - payoff.acceleratedMonths);

  const handleStartQuickEdit = (item: LiabilityItem) => {
    setEditingId(item.id);
    setEditBalanceText(item.balance.toString());
  };

  const handleSaveQuickEdit = (id: string) => {
    const parsed = parseFloat(editBalanceText);
    if (!isNaN(parsed) && parsed >= 0) {
      onQuickUpdateBalance(id, parsed);
    }
    setEditingId(null);
  };

  // Sorted items based on strategy
  const sortedLiabilities = [...liabilities].sort((a, b) => {
    if (payoffStrategy === 'avalanche') {
      return b.interestRate - a.interestRate; // High APR first
    }
    return a.balance - b.balance; // Low balance first
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Liabilities & Debt Amortization
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{liabilities.length} debt accounts</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-rose-400">
              Total {formatCurrency(totalDebt, currency)}
            </span>
          </div>
        </div>

        <button
          onClick={onAddLiability}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-rose-400 hover:bg-rose-300 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Debt / Loan</span>
        </button>
      </div>

      {/* Debt Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Total Outstanding Debt</div>
          <div className="text-2xl font-bold text-rose-300 font-mono tabular-nums">
            {formatCurrency(totalDebt, currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Principal balance across all lenders
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Total Monthly Servicing</div>
          <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
            {formatCurrency(totalMonthlyMin, currency)}/mo
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Required contractual minimums
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Weighted Interest Rate (APR)</div>
          <div className="text-2xl font-bold text-amber-300 font-mono tabular-nums">
            {formatPercent(weightedInterestRate, 2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {weightedInterestRate < 4.5 ? 'Favorable low-rate debt' : 'Consider refinancing'}
          </div>
        </div>
      </div>

      {/* Debt Payoff Acceleration Simulator */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-[#111827]/90 to-[#0c121d]/90 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white tracking-tight">
                Debt Elimination Engine & Interest Saver
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate accelerated debt payoff and compute interest saved
            </p>
          </div>

          {/* Strategy selector */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setPayoffStrategy('avalanche')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                payoffStrategy === 'avalanche'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Avalanche (Highest APR)</span>
            </button>
            <button
              onClick={() => setPayoffStrategy('snowball')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                payoffStrategy === 'snowball'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-sky-400" />
              <span>Snowball (Smallest Balance)</span>
            </button>
          </div>
        </div>

        {/* Extra payment slider */}
        <div className="space-y-3 pb-6 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Accelerated Monthly Contribution:
            </span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              +{formatCurrency(extraPaymentMonthly, currency)}/mo
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3000"
            step="50"
            value={extraPaymentMonthly}
            onChange={(e) => setExtraPaymentMonthly(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>+$0/mo (Minimums only)</span>
            <span>+$1,500/mo</span>
            <span>+$3,000/mo</span>
          </div>
        </div>

        {/* Results readout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Time to 100% Debt-Free</div>
            <div className="text-lg font-bold text-slate-100 font-mono tabular-nums">
              {(payoff.acceleratedMonths / 12).toFixed(1)} years ({payoff.acceleratedMonths} mo)
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              {monthsSaved > 0 ? `${(monthsSaved / 12).toFixed(1)} years faster` : 'Standard pace'}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Total Interest Eliminated</div>
            <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {formatCurrency(payoff.interestSaved, currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Direct cash kept in your pocket
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Priority Target Debt</div>
            <div className="text-sm font-semibold text-slate-200 truncate mt-0.5">
              {sortedLiabilities.length > 0 ? sortedLiabilities[0].name : 'None'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {sortedLiabilities.length > 0
                ? `${sortedLiabilities[0].interestRate}% APR · ${formatCurrency(sortedLiabilities[0].balance, currency)}`
                : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Liabilities Table */}
      <div className="rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                <th className="py-3 px-4 font-medium">Liability Name</th>
                <th className="py-3 px-4 font-medium">Creditor / Lender</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium text-right">Interest Rate (APR)</th>
                <th className="py-3 px-4 font-medium text-right">Monthly Payment</th>
                <th className="py-3 px-4 font-medium text-right">Outstanding Balance</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedLiabilities.length > 0 ? (
                sortedLiabilities.map((item, idx) => {
                  const meta = LIABILITY_CATEGORY_META[item.category];
                  const isEditingThis = editingId === item.id;
                  const isTopPriority = idx === 0 && liabilities.length > 1;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100 group-hover:text-rose-300 transition-colors">
                            {item.name}
                          </span>
                          {isTopPriority && (
                            <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              #1 Payoff Focus
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {item.lender}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-300">
                          {meta ? meta.label : item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-amber-300 tabular-nums">
                        {item.interestRate.toFixed(2)}%
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-300 tabular-nums">
                        {formatCurrency(item.monthlyPayment, currency)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              value={editBalanceText}
                              onChange={(e) => setEditBalanceText(e.target.value)}
                              className="w-28 bg-slate-900 border border-rose-500 rounded px-2 py-1 text-xs text-right text-white font-mono"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQuickEdit(item.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveQuickEdit(item.id)}
                              className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartQuickEdit(item)}
                            title="Click to quick-update balance"
                            className="font-mono font-bold text-rose-300 tabular-nums cursor-pointer hover:text-rose-200 transition-colors inline-block"
                          >
                            {formatCurrency(item.balance, currency)}
                          </div>
                        )}
                        {item.payoffTargetDate && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Target: {item.payoffTargetDate}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditLiability(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Liability"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteLiability(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Liability"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm">No liabilities or debts on record.</p>
                    <button
                      onClick={onAddLiability}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log a mortgage or loan
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
