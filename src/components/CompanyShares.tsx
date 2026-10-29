import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Plus, 
  Check, 
  ShieldCheck, 
  Info,
  DollarSign
} from 'lucide-react';
import { TSLA_QUOTE, MARKET_WATCHLIST, REGULATED_INSTITUTIONS } from '../data/marketData';
import { StockQuote } from '../types';

export const CompanyShares: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<StockQuote>(TSLA_QUOTE);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['TSLA', 'SPY']);
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; close: number } | null>(null);

  const toggleWatchlist = (symbol: string) => {
    setWatchlistSymbols(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  // SVG Chart Calculation
  const history = selectedStock.history || [];
  const minPrice = Math.min(...history.map(p => p.close)) * 0.95;
  const maxPrice = Math.max(...history.map(p => p.close)) * 1.05;
  const chartHeight = 220;
  const chartWidth = 600;

  const pointsString = history.map((pt, idx) => {
    const x = (idx / (history.length - 1)) * chartWidth;
    const y = chartHeight - ((pt.close - minPrice) / (maxPrice - minPrice)) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const isPositive = selectedStock.change >= 0;

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-neutral-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
            <TrendingUp className="w-4 h-4 text-white" />
            <span>Public Capital Markets & Equity Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Company Shares & Market Information
          </h1>
          <p className="mt-2 text-neutral-400 text-sm max-w-2xl">
            Educational data regarding publicly traded enterprise valuations, capital market risks, and authentic financial instruments.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Standard 15-Minute Delayed Market Quotes</span>
        </div>
      </div>

      {/* Main Stock Showcase Card */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8">
        
        {/* Top Stock Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {selectedStock.symbol}
              </span>
              <span className="text-sm sm:text-base text-neutral-400 font-medium">
                {selectedStock.companyName}
              </span>
              <span className="text-xs bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded font-mono border border-neutral-800">
                NASDAQ
              </span>
            </div>
            <div className="text-xs text-neutral-500 font-mono mt-1">
              Data feed as of {selectedStock.updatedAt}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                ${selectedStock.price.toFixed(2)}
              </div>
              <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 mt-0.5 ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{isPositive ? '+' : ''}{selectedStock.change.toFixed(2)} ({isPositive ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <button
              onClick={() => toggleWatchlist(selectedStock.symbol)}
              className={`p-3 rounded-xl border transition-colors flex items-center gap-2 text-xs font-bold uppercase ${
                watchlistSymbols.includes(selectedStock.symbol)
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 text-white border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {watchlistSymbols.includes(selectedStock.symbol) ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add to Watchlist</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Chart Container */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono text-neutral-400">
              {hoveredPoint ? (
                <span>Hovered: <strong className="text-white font-mono">${hoveredPoint.close.toFixed(2)}</strong> on {hoveredPoint.date}</span>
              ) : (
                <span>Historical Closing Trend (Normalized)</span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 text-xs">
              {(['1M', '6M', '1Y', 'ALL'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded font-mono transition-colors ${
                    timeRange === range ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart Line */}
          <div className="relative w-full h-[220px] bg-neutral-950/50 rounded-xl overflow-hidden border border-neutral-900 flex items-center justify-center">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <polygon
                points={`0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`}
                fill="url(#chartGradient)"
              />

              {/* Line path */}
              <polyline
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Hover nodes */}
              {history.map((pt, i) => {
                const cx = (i / (history.length - 1)) * chartWidth;
                const cy = chartHeight - ((pt.close - minPrice) / (maxPrice - minPrice)) * chartHeight;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={hoveredPoint?.date === pt.date ? "5" : "3"}
                    className="cursor-pointer fill-white hover:fill-neutral-300 transition-all"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-neutral-500 mt-2 px-1">
            <span>{history[0]?.date || 'Start'}</span>
            <span>{history[Math.floor(history.length / 2)]?.date || 'Mid'}</span>
            <span>{history[history.length - 1]?.date || 'Latest'}</span>
          </div>
        </div>

        {/* Fundamentals Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-900 text-xs">
          <div className="p-3 bg-neutral-900/60 rounded-xl">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">Market Capitalization</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">{selectedStock.marketCap}</span>
          </div>
          <div className="p-3 bg-neutral-900/60 rounded-xl">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">Price-to-Earnings (P/E)</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">{selectedStock.peRatio}x</span>
          </div>
          <div className="p-3 bg-neutral-900/60 rounded-xl">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">52-Week Range</span>
            <span className="text-sm font-bold font-mono text-white mt-1.5 block">
              ${selectedStock.low52Week} – ${selectedStock.high52Week}
            </span>
          </div>
          <div className="p-3 bg-neutral-900/60 rounded-xl">
            <span className="text-neutral-500 block uppercase font-mono text-[10px]">Average Volume</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">{selectedStock.volume}</span>
          </div>
        </div>

      </div>

      {/* Watchlist & Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Watchlist & Market Leaders */}
        <div className="md:col-span-2 bg-neutral-950 border border-neutral-900 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-900">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">
              Public Securities & Index Watchlist
            </h2>
            <span className="text-xs text-neutral-500 font-mono">Click row to inspect</span>
          </div>

          <div className="divide-y divide-neutral-900 text-xs">
            {MARKET_WATCHLIST.map((stock) => {
              const inWatch = watchlistSymbols.includes(stock.symbol);
              const pos = stock.change >= 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className={`py-3.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                    selectedStock.symbol === stock.symbol ? 'bg-neutral-900' : 'hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(stock.symbol);
                      }}
                      className="text-neutral-500 hover:text-white"
                    >
                      {inWatch ? <Check className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="font-mono font-bold text-white text-sm">{stock.symbol}</div>
                      <div className="text-[11px] text-neutral-400">{stock.companyName}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-white text-sm">${stock.price.toFixed(2)}</div>
                    <div className={`font-mono text-[11px] ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Risk Notice */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wide">
            <AlertCircle className="w-4 h-4 text-neutral-400" />
            <span>Market Risk Disclosures</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Equity investments are subject to market risks, including the possible loss of principal. Share prices fluctuate based on macro conditions, industry competition, and operating cash flows.
          </p>
          <div className="p-3 bg-neutral-900 rounded-xl text-xs space-y-2 border border-neutral-800">
            <strong className="text-white block text-[11px] uppercase">Compliance Mandate:</strong>
            <p className="text-neutral-400 text-[11px]">
              This platform does not execute securities transactions, accept deposits, or promise investment returns. To buy or sell shares, utilize licensed, SIPC/FIPC-insured brokerage platforms.
            </p>
          </div>
        </div>

      </div>

      {/* Regulated Investment Platforms */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8">
        <h3 className="text-base font-bold uppercase tracking-wide text-white mb-4">
          Regulated Securities Depositories & Brokerages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGULATED_INSTITUTIONS.map((inst, i) => (
            <div key={i} className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-neutral-500 uppercase">{inst.regulatoryBody}</span>
                <h4 className="text-sm font-bold text-white mt-1">{inst.name}</h4>
                <p className="text-xs text-neutral-400 mt-1">{inst.category}</p>
              </div>
              <a
                href={inst.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-white font-semibold hover:underline"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
