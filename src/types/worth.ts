export type AssetCategory =
  | 'cash'
  | 'investments'
  | 'real_estate'
  | 'crypto'
  | 'alternatives'
  | 'vehicles';

export type LiabilityCategory =
  | 'mortgage'
  | 'student_loan'
  | 'auto_loan'
  | 'credit_card'
  | 'personal_loan'
  | 'other_debt';

export type TaxTreatment = 'taxable' | 'tax_advantaged' | 'tax_free' | 'not_applicable';

export type LiquidityStatus = 'liquid' | 'semi_liquid' | 'illiquid';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF';

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  institution: string;
  value: number;
  currency: CurrencyCode;
  taxTreatment: TaxTreatment;
  liquidity: LiquidityStatus;
  notes?: string;
  updatedDate: string;
  historicalValuations?: Array<{ date: string; value: number }>;
}

export interface LiabilityItem {
  id: string;
  name: string;
  category: LiabilityCategory;
  lender: string;
  balance: number;
  currency: CurrencyCode;
  interestRate: number; // e.g. 4.25
  monthlyPayment: number;
  payoffTargetDate?: string;
  notes?: string;
  updatedDate: string;
}

export interface HistoricalSnapshot {
  date: string; // YYYY-MM
  label: string; // 'Jan 25', etc.
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidNetWorth: number;
}

export interface TargetAllocation {
  category: AssetCategory;
  targetPct: number;
}

export interface UserWealthProfile {
  id: string;
  name: string;
  roleTitle: string;
  avatarUrl?: string;
  currency: CurrencyCode;
  annualExpenses: number;
  targetFireAge: number;
  currentAge: number;
  expectedAnnualReturn: number; // e.g. 7.5
  expectedInflation: number; // e.g. 2.5
  monthlySavings: number;
  safeWithdrawalRate: number; // e.g. 4.0
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  history: HistoricalSnapshot[];
  targetAllocations: TargetAllocation[];
}
