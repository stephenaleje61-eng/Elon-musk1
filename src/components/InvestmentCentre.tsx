import React, { useState } from 'react';
import { 
  Calculator, 
  Target, 
  BookOpen, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { INVESTMENT_MODULES, REGULATED_INSTITUTIONS } from '../data/marketData';

export const InvestmentCentre: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compound' | 'goal' | 'education' | 'news'>('compound');
  
  // Compound Calculator State
  const [initialPrincipal, setInitialPrincipal] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);
  const [annualRate, setAnnualRate] = useState<number>(8); // 8% avg historical stock market
  const [investmentYears, setInvestmentYears] = useState<number>(15);
  const [compoundFrequency, setCompoundFrequency] = useState<number>(12); // monthly

  // Goal Calculator State
  const [targetGoal, setTargetGoal] = useState<number>(100000);
  const [goalStarting, setGoalStarting] = useState<number>(10000);
  const [goalYears, setGoalYears] = useState<number>(10);
  const [goalExpectedReturn, setGoalExpectedReturn] = useState<number>(7);

  // Accordion state for educational modules
  const [expandedModule, setExpandedModule] = useState<string | null>('compound-interest');

  // Compound Interest Calculation
  // FV = P * (1 + r/n)^(n*t) + PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]
  const calculateCompoundInterest = () => {
    const P = initialPrincipal;
    const PMT = monthlyContribution;
    const r = annualRate / 100;
    const n = compoundFrequency;
    const t = investmentYears;

    const ratePerPeriod = r / n;
    const totalPeriods = n * t;

    let futureValue = 0;
    if (r === 0) {
      futureValue = P + (PMT * 12 * t);
    } else {
      const growthFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
      const principalFuture = P * growthFactor;
      // Monthly contributions compounded
      const contributionFuture = PMT * ((growthFactor - 1) / (r / 12));
      futureValue = principalFuture + contributionFuture;
    }

    const totalInvested = P + (PMT * 12 * t);
    const totalInterestEarned = Math.max(0, futureValue - totalInvested);

    return {
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      totalInterestEarned: Math.round(totalInterestEarned)
    };
  };

  const compoundResults = calculateCompoundInterest();

  // Goal Calculation: Required Monthly Contribution
  const calculateRequiredContribution = () => {
    const FV = targetGoal;
    const P = goalStarting;
    const r = goalExpectedReturn / 100;
    const t = goalYears;
    const n = 12;

    const ratePerMonth = r / n;
    const totalMonths = n * t;

    const principalGrowth = P * Math.pow(1 + ratePerMonth, totalMonths);
    const remainingToFund = FV - principalGrowth;

    if (remainingToFund <= 0) return 0;
    if (r === 0) return Math.round(remainingToFund / totalMonths);

    const requiredPMT = remainingToFund * (ratePerMonth / (Math.pow(1 + ratePerMonth, totalMonths) - 1));
    return Math.max(0, Math.round(requiredPMT));
  };

  const requiredMonthly = calculateRequiredContribution();

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-neutral-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
            <BookOpen className="w-4 h-4 text-white" />
            <span>Financial Literacy & Capital Strategy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Investment Education Centre
          </h1>
          <p className="mt-2 text-neutral-400 text-sm max-w-2xl">
            Mathematical models, compound growth calculators, risk allocation fundamentals, and fraud defense principles.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('compound')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'compound' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Compound Growth
          </button>
          <button
            onClick={() => setActiveTab('goal')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'goal' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Goal Targeter
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'education' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Curriculum
          </button>
        </div>
      </div>

      {/* STRICT NO-GUARANTEED-RETURNS DISCLAIMER */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-3 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Educational Purpose Only:</strong>
          This centre provides educational simulation tools. We never advertise guaranteed returns, accept investment deposits, or manage private portfolios. Elon Musk and Tesla do not endorse any individual speculative crypto pools or high-yield trading bots.
        </div>
      </div>

      {/* TAB 1: COMPOUND INTEREST CALCULATOR */}
      {activeTab === 'compound' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Controls */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8 space-y-5">
            <h2 className="text-lg font-bold uppercase tracking-wide text-white border-b border-neutral-900 pb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-neutral-300" />
              <span>Capital Growth Parameters</span>
            </h2>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 uppercase font-semibold">Starting Capital</span>
                <span className="text-white font-mono font-bold">${initialPrincipal.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="500"
                value={initialPrincipal}
                onChange={(e) => setInitialPrincipal(Number(e.target.value))}
                className="w-full accent-white bg-neutral-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 uppercase font-semibold">Monthly Contribution</span>
                <span className="text-white font-mono font-bold">${monthlyContribution.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full accent-white bg-neutral-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 uppercase font-semibold">Annual Expected Growth Rate</span>
                <span className="text-white font-mono font-bold">{annualRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full accent-white bg-neutral-800"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">S&P 500 long-term historical avg ~8-10%</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 uppercase font-semibold">Time Horizon</span>
                <span className="text-white font-mono font-bold">{investmentYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className="w-full accent-white bg-neutral-800"
              />
            </div>
          </div>

          {/* Results Visualizer (2 Columns) */}
          <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">
                Projected Portfolio Outcome ({investmentYears} Years)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                  <span className="text-neutral-500 uppercase font-mono text-[10px] block">Future Valuation</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 block">
                    ${compoundResults.futureValue.toLocaleString()}
                  </span>
                </div>
                <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                  <span className="text-neutral-500 uppercase font-mono text-[10px] block">Total Principal Deposited</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-300 mt-1 block">
                    ${compoundResults.totalInvested.toLocaleString()}
                  </span>
                </div>
                <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
                  <span className="text-neutral-500 uppercase font-mono text-[10px] block">Compound Interest Earned</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                    +${compoundResults.totalInterestEarned.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Proportion Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Deposited Capital: {Math.round((compoundResults.totalInvested / Math.max(1, compoundResults.futureValue)) * 100)}%</span>
                  <span>Pure Growth: {Math.round((compoundResults.totalInterestEarned / Math.max(1, compoundResults.futureValue)) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, (compoundResults.totalInvested / Math.max(1, compoundResults.futureValue)) * 100)}%` }}
                    className="bg-neutral-600 h-full"
                  />
                  <div
                    style={{ width: `${Math.min(100, (compoundResults.totalInterestEarned / Math.max(1, compoundResults.futureValue)) * 100)}%` }}
                    className="bg-white h-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl text-xs text-neutral-400 leading-relaxed">
              <strong className="text-white block mb-1">The Geometric Curve:</strong>
              Notice how the interest earned (${compoundResults.totalInterestEarned.toLocaleString()}) overtakes the physical deposited sum over longer durations. Time in the market reliably beats speculative timing.
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: INVESTMENT GOAL CALCULATOR */}
      {activeTab === 'goal' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="border-b border-neutral-900 pb-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-neutral-300" />
              <span>Investment Goal Reverse Calculator</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Determine the required monthly contribution necessary to reach your milestone capital reserve.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Target Capital Goal ($)
              </label>
              <input
                type="number"
                step="1000"
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Current Starting Reserve ($)
              </label>
              <input
                type="number"
                step="500"
                value={goalStarting}
                onChange={(e) => setGoalStarting(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Timeline (Years)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={goalYears}
                onChange={(e) => setGoalYears(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Expected Annual Yield (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={goalExpectedReturn}
                onChange={(e) => setGoalExpectedReturn(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-center space-y-1">
            <span className="text-xs font-mono uppercase text-neutral-400">Required Monthly Contribution:</span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              ${requiredMonthly.toLocaleString()}<span className="text-sm font-normal text-neutral-400"> / month</span>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Based on compounding monthly at {goalExpectedReturn}% annualized over {goalYears} years to reach ${targetGoal.toLocaleString()}.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: EDUCATIONAL CURRICULUM */}
      {activeTab === 'education' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INVESTMENT_MODULES.map((module) => {
            const isExpanded = expandedModule === module.id;

            return (
              <div
                key={module.id}
                className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 transition-all"
              >
                <div
                  onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">
                    {module.title}
                  </h3>
                  <button className="text-neutral-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  {module.summary}
                </p>

                {isExpanded && (
                  <ul className="mt-4 pt-4 border-t border-neutral-900 space-y-2 text-xs text-neutral-300">
                    {module.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Institutional Platform Directory */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8">
        <h3 className="text-base font-bold uppercase tracking-wide text-white mb-4">
          Verified Institutional Gateways
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGULATED_INSTITUTIONS.map((inst, idx) => (
            <div key={idx} className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">{inst.regulatoryBody}</span>
                <h4 className="text-sm font-bold text-white mt-1">{inst.name}</h4>
                <p className="text-xs text-neutral-400 mt-1">{inst.category}</p>
              </div>
              <a
                href={inst.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-white font-semibold hover:underline"
              >
                <span>Visit Platform</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
