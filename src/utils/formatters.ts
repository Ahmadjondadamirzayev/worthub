import { CurrencyCode, AssetCategory, LiabilityCategory } from '../types/worth';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  CHF: 'CHF ',
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD', compact = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${symbol}${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 10_000) {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${symbol}${(amount / 1_000).toFixed(0)}k`;
  }

  const fractionDigits = currency === 'JPY' ? 0 : (Math.abs(amount) < 100 ? 2 : 0);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);

  return `${CURRENCY_SYMBOLS[currency] || '$'}${formatted}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDelta(current: number, previous: number, currency: CurrencyCode = 'USD'): {
  diff: number;
  pct: number;
  formattedDiff: string;
  formattedPct: string;
  isPositive: boolean;
} {
  const diff = current - previous;
  const pct = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;
  const isPositive = diff >= 0;
  const sign = isPositive ? '+' : '-';
  const absDiff = Math.abs(diff);

  return {
    diff,
    pct,
    formattedDiff: `${sign}${formatCurrency(absDiff, currency)}`,
    formattedPct: `${sign}${Math.abs(pct).toFixed(1)}%`,
    isPositive,
  };
}

export const ASSET_CATEGORY_META: Record<
  AssetCategory,
  { label: string; color: string; bgClass: string; textClass: string; description: string }
> = {
  cash: {
    label: 'Cash & Cash Equivalents',
    color: '#0ea5e9', // Sky
    bgClass: 'bg-sky-500/10 border-sky-500/20',
    textClass: 'text-sky-400',
    description: 'Checking, savings, CDs, money market, and high-yield deposits',
  },
  investments: {
    label: 'Stocks & Equities',
    color: '#10b981', // Emerald
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    textClass: 'text-emerald-400',
    description: 'Public equities, index funds, ETFs, 401(k), IRA, brokerage',
  },
  real_estate: {
    label: 'Real Estate & Properties',
    color: '#f59e0b', // Amber
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    textClass: 'text-amber-400',
    description: 'Primary residence, rental properties, land, and syndications',
  },
  crypto: {
    label: 'Digital Assets & Crypto',
    color: '#8b5cf6', // Violet
    bgClass: 'bg-violet-500/10 border-violet-500/20',
    textClass: 'text-violet-400',
    description: 'Bitcoin, Ethereum, cold storage, and decentralized holdings',
  },
  alternatives: {
    label: 'Alternative & Private Equity',
    color: '#ec4899', // Pink
    bgClass: 'bg-pink-500/10 border-pink-500/20',
    textClass: 'text-pink-400',
    description: 'Venture capital, angel syndicates, art, gold & private business',
  },
  vehicles: {
    label: 'Vehicles & Physical Assets',
    color: '#64748b', // Slate
    bgClass: 'bg-slate-500/10 border-slate-500/20',
    textClass: 'text-slate-400',
    description: 'Automobiles, boats, collector items, and equipment',
  },
};

export const LIABILITY_CATEGORY_META: Record<
  LiabilityCategory,
  { label: string; color: string; bgClass: string; textClass: string; description: string }
> = {
  mortgage: {
    label: 'Mortgages',
    color: '#f43f5e',
    bgClass: 'bg-rose-500/10 border-rose-500/20',
    textClass: 'text-rose-400',
    description: 'Primary home loan and property liens',
  },
  auto_loan: {
    label: 'Auto Financing',
    color: '#fb923c',
    bgClass: 'bg-orange-500/10 border-orange-500/20',
    textClass: 'text-orange-400',
    description: 'Vehicle loans and long-term equipment financing',
  },
  student_loan: {
    label: 'Student Loans',
    color: '#a855f7',
    bgClass: 'bg-purple-500/10 border-purple-500/20',
    textClass: 'text-purple-400',
    description: 'Federal and private academic loans',
  },
  credit_card: {
    label: 'Credit Cards',
    color: '#ef4444',
    bgClass: 'bg-red-500/10 border-red-500/20',
    textClass: 'text-red-400',
    description: 'Revolving unsecured card balances',
  },
  personal_loan: {
    label: 'Personal Lines of Credit',
    color: '#eab308',
    bgClass: 'bg-yellow-500/10 border-yellow-500/20',
    textClass: 'text-yellow-400',
    description: 'Unsecured installment loans and personal credit',
  },
  other_debt: {
    label: 'Other Liabilities',
    color: '#94a3b8',
    bgClass: 'bg-slate-500/10 border-slate-500/20',
    textClass: 'text-slate-400',
    description: 'Promissory notes, tax liabilities, and commercial notes',
  },
};

export function calculateFireMilestones(
  annualExpenses: number,
  currentInvestments: number,
  monthlySavings: number,
  annualReturnPct: number = 7.0,
  safeWithdrawalRatePct: number = 4.0
) {
  const swrDecimal = safeWithdrawalRatePct / 100;
  const standardFireNumber = annualExpenses / swrDecimal;
  const leanFireNumber = (annualExpenses * 0.75) / swrDecimal;
  const fatFireNumber = (annualExpenses * 1.5) / swrDecimal;
  
  // Coast FIRE: Amount needed today so that without any further savings, at age 65 (assuming current age 32 -> 33 years), it reaches standard FIRE number at annualReturnPct
  const r = annualReturnPct / 100;
  const yearsToRetirement = 30;
  const coastFireNumber = standardFireNumber / Math.pow(1 + r, yearsToRetirement);

  const progressPct = standardFireNumber > 0 ? (currentInvestments / standardFireNumber) * 100 : 0;
  const runwayMonths = annualExpenses > 0 ? (currentInvestments / (annualExpenses / 12)) : 0;

  // Calculate years to reach standard FIRE with current monthly savings and compound return
  let projectedYears = 0;
  let simulatedBalance = currentInvestments;
  const monthlyRate = r / 12;
  const maxMonths = 600; // 50 years max
  let monthsCount = 0;

  if (simulatedBalance >= standardFireNumber) {
    projectedYears = 0;
  } else if (monthlySavings <= 0 && r <= 0) {
    projectedYears = Infinity;
  } else {
    while (simulatedBalance < standardFireNumber && monthsCount < maxMonths) {
      simulatedBalance = simulatedBalance * (1 + monthlyRate) + monthlySavings;
      monthsCount++;
    }
    projectedYears = monthsCount / 12;
  }

  return {
    standardFireNumber,
    leanFireNumber,
    fatFireNumber,
    coastFireNumber,
    progressPct: Math.min(progressPct, 1000),
    runwayMonths,
    runwayYears: runwayMonths / 12,
    projectedYears: monthsCount < maxMonths ? projectedYears : null,
  };
}

export function generateCSV(
  assets: Array<{ name: string; category: string; institution: string; value: number }>,
  liabilities: Array<{ name: string; category: string; lender: string; balance: number; interestRate: number }>,
  currency: CurrencyCode
): string {
  const lines: string[] = [];
  lines.push(`"WORTHHUB BALANCE SHEET EXPORT"`);
  lines.push(`"Generated: ${new Date().toISOString()}"`);
  lines.push(`"Reporting Currency: ${currency}"`);
  lines.push('');
  lines.push('"ASSETS"');
  lines.push('"Asset Name","Category","Institution","Valuation"');
  for (const a of assets) {
    lines.push(`"${a.name}","${a.category}","${a.institution}",${a.value}`);
  }
  lines.push('');
  lines.push('"LIABILITIES & DEBTS"');
  lines.push('"Liability Name","Category","Lender / Creditor","Balance","Interest Rate %"');
  for (const l of liabilities) {
    lines.push(`"${l.name}","${l.category}","${l.lender}",${l.balance},${l.interestRate}`);
  }
  return lines.join('\n');
}
