import React, { useState } from 'react';
import {
  Flame,
  Shield,
  Zap,
  Target,
  Clock,
  Sparkles,
  TrendingUp,
  Compass,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { UserWealthProfile, CurrencyCode } from '../types/worth';
import {
  formatCurrency,
  formatPercent,
  calculateFireMilestones,
} from '../utils/formatters';

interface FireViewProps {
  profile: UserWealthProfile;
  currency: CurrencyCode;
  onUpdateProfileSettings: (settings: {
    annualExpenses: number;
    monthlySavings: number;
    expectedAnnualReturn: number;
    safeWithdrawalRate: number;
    currentAge: number;
    targetFireAge: number;
  }) => void;
}

export const FireView: React.FC<FireViewProps> = ({
  profile,
  currency,
  onUpdateProfileSettings,
}) => {
  const [annualExpenses, setAnnualExpenses] = useState(profile.annualExpenses || 90000);
  const [monthlySavings, setMonthlySavings] = useState(profile.monthlySavings || 5000);
  const [annualReturn, setAnnualReturn] = useState(profile.expectedAnnualReturn || 7.5);
  const [swr, setSwr] = useState(profile.safeWithdrawalRate || 4.0);
  const [currentAge, setCurrentAge] = useState(profile.currentAge || 32);
  const [targetAge, setTargetAge] = useState(profile.targetFireAge || 45);

  // Liquid + invested productive capital (excludes personal vehicles/home equity for strict financial independence calculations, though liquid real estate can be toggled)
  const investedCapital = profile.assets
    .filter((a) => a.category === 'investments' || a.category === 'cash' || a.category === 'crypto')
    .reduce((sum, a) => sum + a.value, 0);

  const totalNetWorth =
    profile.assets.reduce((sum, a) => sum + a.value, 0) -
    profile.liabilities.reduce((sum, l) => sum + l.balance, 0);

  const fire = calculateFireMilestones(
    annualExpenses,
    investedCapital,
    monthlySavings,
    annualReturn,
    swr
  );

  const freedomAge =
    fire.projectedYears !== null
      ? Math.round(currentAge + fire.projectedYears)
      : null;

  // 30-year compounding trajectory dataset
  const projectionYears = 30;
  const projectionData = React.useMemo(() => {
    const list: Array<{
      year: number;
      age: number;
      balanceWithContributions: number;
      balanceCoastOnly: number;
    }> = [];

    let balContrib = investedCapital;
    let balCoast = investedCapital;
    const r = annualReturn / 100;
    const annualContribution = monthlySavings * 12;

    for (let yr = 0; yr <= projectionYears; yr++) {
      list.push({
        year: yr,
        age: currentAge + yr,
        balanceWithContributions: balContrib,
        balanceCoastOnly: balCoast,
      });

      balContrib = balContrib * (1 + r) + annualContribution;
      balCoast = balCoast * (1 + r);
    }
    return list;
  }, [investedCapital, annualReturn, monthlySavings, currentAge]);

  // Chart coordinate calculation
  const maxProjected = Math.max(
    ...projectionData.map((d) => d.balanceWithContributions),
    fire.standardFireNumber * 1.3
  );

  const chartW = 700;
  const chartH = 220;
  const padX = 40;
  const padY = 25;

  const pointsContrib = projectionData.map((d, i) => {
    const x = padX + (i / projectionYears) * (chartW - padX * 2);
    const y =
      chartH - padY - (d.balanceWithContributions / maxProjected) * (chartH - padY * 2);
    return { x, y, val: d.balanceWithContributions, age: d.age, yr: d.year };
  });

  const pointsCoast = projectionData.map((d, i) => {
    const x = padX + (i / projectionYears) * (chartW - padX * 2);
    const y =
      chartH - padY - (d.balanceCoastOnly / maxProjected) * (chartH - padY * 2);
    return { x, y, val: d.balanceCoastOnly };
  });

  const fireY =
    chartH - padY - (fire.standardFireNumber / maxProjected) * (chartH - padY * 2);

  const pathContrib = pointsContrib.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    return `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const pathCoast = pointsCoast.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    return `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaContrib = `${pathContrib} L ${pointsContrib[pointsContrib.length - 1].x} ${chartH - padY} L ${pointsContrib[0].x} ${chartH - padY} Z`;

  // Milestone evaluation
  const milestones = [
    {
      name: 'Coast FIRE',
      target: fire.coastFireNumber,
      achieved: investedCapital >= fire.coastFireNumber,
      pct: fire.coastFireNumber > 0 ? (investedCapital / fire.coastFireNumber) * 100 : 0,
      description: 'Zero additional savings required to reach retirement age 65.',
      icon: <Compass className="w-4 h-4 text-sky-400" />,
      colorClass: 'text-sky-400',
    },
    {
      name: 'Lean FIRE',
      target: fire.leanFireNumber,
      achieved: investedCapital >= fire.leanFireNumber,
      pct: fire.leanFireNumber > 0 ? (investedCapital / fire.leanFireNumber) * 100 : 0,
      description: 'Covers 75% essential baseline expenses in perpetuity.',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      colorClass: 'text-emerald-400',
    },
    {
      name: 'Standard FIRE',
      target: fire.standardFireNumber,
      achieved: investedCapital >= fire.standardFireNumber,
      pct: fire.progressPct,
      description: 'Full current lifestyle funded indefinitely at 4% safe withdrawal.',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      colorClass: 'text-amber-400',
    },
    {
      name: 'Fat FIRE',
      target: fire.fatFireNumber,
      achieved: investedCapital >= fire.fatFireNumber,
      pct: fire.fatFireNumber > 0 ? (investedCapital / fire.fatFireNumber) * 100 : 0,
      description: '150% current spending budget with abundant luxury cushion.',
      icon: <Sparkles className="w-4 h-4 text-violet-400" />,
      colorClass: 'text-violet-400',
    },
  ];

  const handleSaveToProfile = () => {
    onUpdateProfileSettings({
      annualExpenses,
      monthlySavings,
      expectedAnnualReturn: annualReturn,
      safeWithdrawalRate: swr,
      currentAge,
      targetFireAge: targetAge,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            FIRE & Financial Independence Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Safe withdrawal modeling, milestone roadmaps, and capital compounding runways
          </p>
        </div>

        <button
          onClick={handleSaveToProfile}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          Save Assumptions to Profile
        </button>
      </div>

      {/* FIRE Independence Hero Card */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-[#111827]/90 to-[#0c121d]/90 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <span>Financial Independence Number</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">{swr}% Safe Withdrawal Rule</span>
            </div>
            <div className="flex items-baseline gap-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-mono tabular-nums">
                {formatCurrency(fire.standardFireNumber, currency)}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xl">
              Annual living expenses of {formatCurrency(annualExpenses, currency)} funded indefinitely at a {swr}% perpetual withdrawal rate.
            </p>
          </div>

          {/* Progress ring/box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 min-w-[260px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Freedom Progress</span>
              <span className="text-emerald-400 font-mono font-bold">
                {fire.progressPct.toFixed(1)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(fire.progressPct, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Invested: {formatCurrency(investedCapital, currency, true)}</span>
              <span>Goal: {formatCurrency(fire.standardFireNumber, currency, true)}</span>
            </div>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div>
            <div className="text-xs text-slate-400 mb-1">Projected Freedom Age</div>
            <div className="text-lg font-bold text-slate-100 font-mono tabular-nums">
              {freedomAge ? `Age ${freedomAge}` : 'Funded!'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {fire.projectedYears !== null
                ? `In ~${fire.projectedYears.toFixed(1)} years`
                : 'Already independent'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Zero-Income Runway</div>
            <div className="text-lg font-bold text-slate-100 font-mono tabular-nums">
              {fire.runwayYears.toFixed(1)} years
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              ({fire.runwayMonths.toFixed(0)} months of current spend)
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Annual Living Budget</div>
            <div className="text-lg font-bold text-slate-100 font-mono tabular-nums">
              {formatCurrency(annualExpenses, currency)}/yr
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {formatCurrency(annualExpenses / 12, currency)}/month
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Monthly Compounding Fuel</div>
            <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {formatCurrency(monthlySavings, currency)}/mo
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {formatCurrency(monthlySavings * 12, currency)}/year added
            </div>
          </div>
        </div>
      </div>

      {/* 4 Milestones Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Independence Milestones
          </h2>
          <span className="text-xs text-slate-500">
            Stages of Financial Sovereignty
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {milestones.map((m) => (
            <div
              key={m.name}
              className={`p-4 rounded-xl border transition-all ${
                m.achieved
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-200">
                  {m.icon}
                  <span>{m.name}</span>
                </div>
                {m.achieved ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Achieved
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">
                    {m.pct.toFixed(0)}%
                  </span>
                )}
              </div>

              <div className="text-xl font-bold text-white font-mono tabular-nums mb-1">
                {formatCurrency(m.target, currency, true)}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                {m.description}
              </p>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    m.achieved ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                  style={{ width: `${Math.min(m.pct, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Controls & 30-Year Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Console */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md space-y-5">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Scenario Simulator</span>
          </h3>

          {/* Annual Spend */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Annual Living Expenses</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(annualExpenses, currency)}
              </span>
            </div>
            <input
              type="range"
              min="30000"
              max="250000"
              step="2500"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Monthly Savings */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Monthly Savings Added</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(monthlySavings, currency)}/mo
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="250"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Expected Return */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Expected Annual Return</span>
              <span className="font-mono font-bold text-white">
                {annualReturn.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="4.0"
              max="12.0"
              step="0.5"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Conservative (5%)</span>
              <span>Hist. S&P (8-10%)</span>
            </div>
          </div>

          {/* Safe Withdrawal Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Safe Withdrawal Rate (SWR)</span>
              <span className="font-mono font-bold text-amber-400">
                {swr.toFixed(2)}%
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="5.0"
              step="0.25"
              value={swr}
              onChange={(e) => setSwr(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Ultra-Safe (3.25%)</span>
              <span>Trinity Study (4.0%)</span>
            </div>
          </div>

          {/* Current Age */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current Age</span>
              <span className="font-mono font-bold text-white">
                {currentAge} yrs
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              step="1"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* 30-Year Compounding Projection Visual Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  30-Year Compounding Trajectory
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
                    With Contributions
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-slate-500 inline-block" />
                    Coast Only (No Additions)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-amber-400 inline-block border-t border-dashed" />
                    FIRE Threshold
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Trajectory Chart */}
            <div className="relative w-full">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-52 sm:h-60"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid line */}
                <line
                  x1={padX}
                  y1={chartH / 2}
                  x2={chartW - padX}
                  y2={chartH / 2}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />

                {/* FIRE Target line */}
                {fireY > 0 && fireY < chartH && (
                  <g>
                    <line
                      x1={padX}
                      y1={fireY}
                      x2={chartW - padX}
                      y2={fireY}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />
                    <text
                      x={chartW - padX - 4}
                      y={fireY - 6}
                      fill="#f59e0b"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      FIRE Target: {formatCurrency(fire.standardFireNumber, currency, true)}
                    </text>
                  </g>
                )}

                {/* Area under accelerated line */}
                <path d={areaContrib} fill="url(#fireGrad)" />

                {/* Coast line */}
                <path
                  d={pathCoast}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Accelerated line */}
                <path
                  d={pathContrib}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between px-6 pt-2 text-[11px] text-slate-500 font-mono">
                <span>Today (Age {currentAge})</span>
                <span>+10 yrs (Age {currentAge + 10})</span>
                <span>+20 yrs (Age {currentAge + 20})</span>
                <span>+30 yrs (Age {currentAge + 30})</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              In 30 years at {annualReturn}% return, your portfolio is projected to reach{' '}
              <strong className="text-emerald-400 font-mono">
                {formatCurrency(
                  projectionData[projectionData.length - 1].balanceWithContributions,
                  currency,
                  true
                )}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
