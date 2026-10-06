import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  PieChart,
  ArrowRight,
  Wallet,
  Building,
  Coins,
  Gem,
  Car,
  CircleDollarSign,
  Info,
} from 'lucide-react';
import { UserWealthProfile, CurrencyCode, AssetCategory } from '../types/worth';
import {
  formatCurrency,
  formatPercent,
  formatDelta,
  ASSET_CATEGORY_META,
} from '../utils/formatters';

interface OverviewViewProps {
  profile: UserWealthProfile;
  currency: CurrencyCode;
  onNavigateTab: (tab: string, filterCategory?: AssetCategory) => void;
  onOpenAddModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  profile,
  currency,
  onNavigateTab,
  onOpenAddModal,
}) => {
  const [chartRange, setChartRange] = useState<'6m' | '1y' | 'all'>('1y');
  const [chartMetric, setChartMetric] = useState<'networth' | 'comparison' | 'liquid'>('networth');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);

  // Compute aggregate values
  const totalAssets = profile.assets.reduce((sum, item) => sum + item.value, 0);
  const totalLiabilities = profile.liabilities.reduce((sum, item) => sum + item.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const liquidAssets = profile.assets
    .filter((a) => a.liquidity === 'liquid')
    .reduce((sum, a) => sum + a.value, 0);
  const shortTermDebts = profile.liabilities
    .filter((l) => l.category === 'credit_card' || l.category === 'personal_loan')
    .reduce((sum, l) => sum + l.balance, 0);
  const liquidNetWorth = liquidAssets - shortTermDebts;

  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const monthlyBurn = profile.annualExpenses > 0 ? profile.annualExpenses / 12 : 5000;
  const emergencyMonthsRunway = monthlyBurn > 0 ? liquidAssets / monthlyBurn : 0;

  // History calculation
  const history = profile.history && profile.history.length > 0 ? profile.history : [];
  const filteredHistory = React.useMemo(() => {
    if (history.length === 0) return [];
    if (chartRange === '6m') return history.slice(-6);
    if (chartRange === '1y') return history.slice(-12);
    return history;
  }, [history, chartRange]);

  // Delta calculation compared to previous period in history
  const previousSnapshot = history.length > 1 ? history[history.length - 2] : null;
  const delta = previousSnapshot
    ? formatDelta(netWorth, previousSnapshot.netWorth, currency)
    : { diff: 0, pct: 0, formattedDiff: '+0', formattedPct: '0.0%', isPositive: true };

  // Category aggregations
  const categoryTotals: Record<AssetCategory, number> = {
    cash: 0,
    investments: 0,
    real_estate: 0,
    crypto: 0,
    alternatives: 0,
    vehicles: 0,
  };
  profile.assets.forEach((a) => {
    categoryTotals[a.category] = (categoryTotals[a.category] || 0) + a.value;
  });

  // Calculate SVG Chart dimensions and coordinates
  const chartHeight = 240;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;

  const chartPoints = React.useMemo(() => {
    if (filteredHistory.length === 0) return null;

    const values = filteredHistory.map((h) => {
      if (chartMetric === 'networth') return h.netWorth;
      if (chartMetric === 'liquid') return h.liquidNetWorth;
      return h.netWorth;
    });

    const assetValues = filteredHistory.map((h) => h.totalAssets);
    const liabilityValues = filteredHistory.map((h) => h.totalLiabilities);

    const allValues =
      chartMetric === 'comparison'
        ? [...assetValues, ...liabilityValues]
        : values;

    const minVal = Math.min(...allValues) * 0.95;
    const maxVal = Math.max(...allValues) * 1.05;
    const range = maxVal - minVal || 1;

    const getCoords = (valArr: number[]) =>
      valArr.map((v, i) => {
        const x =
          paddingX +
          (i / Math.max(valArr.length - 1, 1)) * (chartWidth - paddingX * 2);
        const y =
          chartHeight -
          paddingY -
          ((v - minVal) / range) * (chartHeight - paddingY * 2);
        return { x, y, value: v };
      });

    return {
      primary: getCoords(values),
      assets: getCoords(assetValues),
      liabilities: getCoords(liabilityValues),
      minVal,
      maxVal,
    };
  }, [filteredHistory, chartMetric]);

  const makePath = (coords: Array<{ x: number; y: number }>) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = coords[idx - 1];
      const cx = (prev.x + curr.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const primaryPath = chartPoints ? makePath(chartPoints.primary) : '';
  const assetsPath = chartPoints ? makePath(chartPoints.assets) : '';
  const liabilitiesPath = chartPoints ? makePath(chartPoints.liabilities) : '';

  const primaryAreaPath =
    chartPoints && chartPoints.primary.length > 0
      ? `${primaryPath} L ${chartPoints.primary[chartPoints.primary.length - 1].x} ${chartHeight - paddingY} L ${chartPoints.primary[0].x} ${chartHeight - paddingY} Z`
      : '';

  const activePointIdx =
    hoveredDataPoint !== null && hoveredDataPoint < filteredHistory.length
      ? hoveredDataPoint
      : filteredHistory.length - 1;
  const activeSnapshot = filteredHistory[activePointIdx];

  const categoryCards: Array<{ category: AssetCategory; icon: React.ReactNode }> = [
    { category: 'cash', icon: <CircleDollarSign className="w-4 h-4 text-sky-400" /> },
    { category: 'investments', icon: <Wallet className="w-4 h-4 text-emerald-400" /> },
    { category: 'real_estate', icon: <Building className="w-4 h-4 text-amber-400" /> },
    { category: 'crypto', icon: <Coins className="w-4 h-4 text-violet-400" /> },
    { category: 'alternatives', icon: <Gem className="w-4 h-4 text-pink-400" /> },
    { category: 'vehicles', icon: <Car className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Net Worth Hero Card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-[#111827]/90 to-[#0c121d]/90 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <span>Primary Wealth Portfolio</span>
              <span aria-hidden="true">·</span>
              <span>Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Audited Snapshot</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-mono tabular-nums">
                {formatCurrency(netWorth, currency)}
              </h1>
              {previousSnapshot && (
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                    delta.isPositive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {delta.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{delta.formattedDiff}</span>
                  <span className="opacity-80">({delta.formattedPct} MoM)</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xl">
              Consolidated net worth across all liquid balances, investment securities, tangible properties, and liabilities.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 min-w-[280px]">
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Assets</div>
              <div className="text-lg font-bold text-slate-100 font-mono tabular-nums">
                {formatCurrency(totalAssets, currency)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {profile.assets.length} active holdings
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Liabilities</div>
              <div className="text-lg font-bold text-rose-300 font-mono tabular-nums">
                {formatCurrency(totalLiabilities, currency)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {profile.liabilities.length} debt accounts
              </div>
            </div>
          </div>
        </div>

        {/* 4 Financial Health Indicator metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div>
            <div className="text-xs text-slate-400 mb-1">Liquid Net Worth</div>
            <div className="text-base font-semibold text-slate-200 font-mono tabular-nums">
              {formatCurrency(liquidNetWorth, currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Available within 7 days
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Debt-to-Asset Ratio</div>
            <div className="text-base font-semibold text-slate-200 font-mono tabular-nums">
              {formatPercent(debtToAssetRatio)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              {debtToAssetRatio < 35 ? 'Prudent / Low leverage' : 'Moderate leverage'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Cash Runway Buffer</div>
            <div className="text-base font-semibold text-slate-200 font-mono tabular-nums">
              {emergencyMonthsRunway.toFixed(1)} months
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              At {formatCurrency(monthlyBurn, currency)}/mo spend
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Monthly Capital Added</div>
            <div className="text-base font-semibold text-slate-200 font-mono tabular-nums">
              {formatCurrency(profile.monthlySavings, currency)}/mo
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Scheduled savings rate
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart Section */}
      <div className="rounded-xl border border-slate-800 bg-[#111827]/70 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Wealth Trajectory & Historical Compounding
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Monthly valuations</span>
              <span aria-hidden="true">·</span>
              <span>
                {activeSnapshot
                  ? `${activeSnapshot.label}: Net Worth ${formatCurrency(activeSnapshot.netWorth, currency)}`
                  : 'Track balance over time'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Filter */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                onClick={() => setChartMetric('networth')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartMetric === 'networth'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Net Worth
              </button>
              <button
                onClick={() => setChartMetric('comparison')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartMetric === 'comparison'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Assets vs Debt
              </button>
              <button
                onClick={() => setChartMetric('liquid')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartMetric === 'liquid'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Liquid
              </button>
            </div>

            {/* Range selector */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                onClick={() => setChartRange('6m')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartRange === '6m'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                6M
              </button>
              <button
                onClick={() => setChartRange('1y')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartRange === '1y'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1Y
              </button>
              <button
                onClick={() => setChartRange('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  chartRange === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* SVG Chart area */}
        {filteredHistory.length > 0 && chartPoints ? (
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 sm:h-64"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid guide lines */}
              {[0.25, 0.5, 0.75].map((pct, i) => {
                const y = paddingY + pct * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {chartMetric !== 'comparison' ? (
                <>
                  {/* Primary Area Fill */}
                  <path d={primaryAreaPath} fill="url(#emeraldGrad)" />

                  {/* Primary Line */}
                  <path
                    d={primaryPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Points */}
                  {chartPoints.primary.map((pt, i) => {
                    const isHovered = hoveredDataPoint === i;
                    return (
                      <g
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredDataPoint(i)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6 : 3.5}
                          fill="#0b0f17"
                          stroke="#10b981"
                          strokeWidth={isHovered ? 3 : 2}
                        />
                        {/* Invisible larger hover hit area */}
                        <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />
                      </g>
                    );
                  })}
                </>
              ) : (
                <>
                  {/* Assets line (Emerald) */}
                  <path
                    d={assetsPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Liabilities line (Rose) */}
                  <path
                    d={liabilitiesPath}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="5 3"
                  />

                  {/* Points for Assets */}
                  {chartPoints.assets.map((pt, i) => (
                    <circle
                      key={`a-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredDataPoint === i ? 5 : 3}
                      fill="#10b981"
                    />
                  ))}
                  {/* Points for Liabilities */}
                  {chartPoints.liabilities.map((pt, i) => (
                    <circle
                      key={`l-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredDataPoint === i ? 5 : 3}
                      fill="#f43f5e"
                    />
                  ))}
                </>
              )}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between px-6 pt-2 text-[11px] text-slate-500 font-mono">
              {filteredHistory.map((item, idx) => {
                // Show only a few labels to prevent overlap
                const shouldShow =
                  idx === 0 ||
                  idx === filteredHistory.length - 1 ||
                  idx % Math.ceil(filteredHistory.length / 5) === 0;
                return (
                  <span
                    key={item.date}
                    className={shouldShow ? 'opacity-100' : 'opacity-0 select-none'}
                  >
                    {item.label}
                  </span>
                );
              })}
            </div>

            {/* Hover Tooltip display */}
            {activeSnapshot && (
              <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <span className="text-slate-400 font-sans">
                  Snapshot: <strong className="text-white">{activeSnapshot.label}</strong>
                </span>
                <span className="text-slate-300">
                  Net Worth: <strong className="text-emerald-400">{formatCurrency(activeSnapshot.netWorth, currency)}</strong>
                </span>
                <span className="text-slate-400">
                  Total Assets: <strong className="text-slate-200">{formatCurrency(activeSnapshot.totalAssets, currency)}</strong>
                </span>
                <span className="text-slate-400">
                  Total Debt: <strong className="text-rose-300">{formatCurrency(activeSnapshot.totalLiabilities, currency)}</strong>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No historical valuation snapshots logged yet. Add your current assets to begin the compounding timeline.
          </div>
        )}
      </div>

      {/* Asset Allocation Breakdown & Rebalancing */}
      <div className="rounded-xl border border-slate-800 bg-[#111827]/70 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Asset Allocation & Portfolio Weight
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Capital distribution across asset classes vs strategic targets
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('assets')}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Manage Holdings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stacked Percentage Bar */}
        {totalAssets > 0 ? (
          <div className="space-y-4">
            <div className="h-4 w-full rounded-md overflow-hidden flex bg-slate-900">
              {Object.entries(categoryTotals).map(([catKey, val]) => {
                const category = catKey as AssetCategory;
                const pct = (val / totalAssets) * 100;
                if (pct <= 0) return null;
                const meta = ASSET_CATEGORY_META[category];
                return (
                  <div
                    key={catKey}
                    style={{ width: `${pct}%`, backgroundColor: meta.color }}
                    title={`${meta.label}: ${pct.toFixed(1)}% (${formatCurrency(val, currency)})`}
                    className="h-full transition-all hover:opacity-90 cursor-pointer"
                    onClick={() => onNavigateTab('assets', category)}
                  />
                );
              })}
            </div>

            {/* Target vs Current Comparison Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {Object.entries(categoryTotals).map(([catKey, val]) => {
                const category = catKey as AssetCategory;
                const currentPct = totalAssets > 0 ? (val / totalAssets) * 100 : 0;
                const targetObj = profile.targetAllocations.find((t) => t.category === category);
                const targetPct = targetObj ? targetObj.targetPct : 0;
                const deltaPct = currentPct - targetPct;
                const meta = ASSET_CATEGORY_META[category];

                return (
                  <button
                    key={category}
                    onClick={() => onNavigateTab('assets', category)}
                    className="p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="truncate">{meta.label.split('&')[0].trim()}</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono tabular-nums mt-1">
                      {formatCurrency(val, currency, true)}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                      <span>{currentPct.toFixed(1)}%</span>
                      {targetPct > 0 && (
                        <span
                          className={
                            Math.abs(deltaPct) < 3
                              ? 'text-slate-500'
                              : deltaPct > 0
                              ? 'text-amber-400'
                              : 'text-sky-400'
                          }
                          title={`Target: ${targetPct}%, Delta: ${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%`}
                        >
                          {deltaPct > 0 ? `+${deltaPct.toFixed(0)}%` : `${deltaPct.toFixed(0)}%`}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs">
            No assets registered yet. Add cash or investment holdings to view your asset allocation.
          </div>
        )}
      </div>

      {/* Asset Class Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Holdings by Category
          </h2>
          <span className="text-xs text-slate-500">
            Click to inspect holdings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoryCards.map(({ category, icon }) => {
            const meta = ASSET_CATEGORY_META[category];
            const items = profile.assets.filter((a) => a.category === category);
            const totalVal = items.reduce((sum, item) => sum + item.value, 0);
            const pctOfTotal = totalAssets > 0 ? (totalVal / totalAssets) * 100 : 0;

            return (
              <div
                key={category}
                onClick={() => onNavigateTab('assets', category)}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60">
                      {icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {meta.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {pctOfTotal.toFixed(1)}%
                  </span>
                </div>

                <div className="text-xl font-bold text-white font-mono tabular-nums mb-1">
                  {formatCurrency(totalVal, currency)}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>{items.length} {items.length === 1 ? 'position' : 'positions'}</span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 text-[11px]">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
