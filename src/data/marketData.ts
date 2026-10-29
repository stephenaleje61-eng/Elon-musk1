import { StockQuote } from '../types';

export const TSLA_QUOTE: StockQuote = {
  symbol: 'TSLA',
  companyName: 'Tesla, Inc.',
  price: 254.20,
  change: +5.80,
  changePercent: +2.33,
  marketCap: '$808.5B',
  peRatio: 64.2,
  high52Week: 271.00,
  low52Week: 138.80,
  volume: '68.4M',
  updatedAt: '2026-10-28 16:00:00 EST (Delayed 15m)',
  history: [
    { date: 'Nov 25', close: 218.4 },
    { date: 'Dec 25', close: 232.1 },
    { date: 'Jan 26', close: 226.7 },
    { date: 'Feb 26', close: 241.9 },
    { date: 'Mar 26', close: 238.5 },
    { date: 'Apr 26', close: 215.3 },
    { date: 'May 26', close: 229.0 },
    { date: 'Jun 26', close: 248.8 },
    { date: 'Jul 26', close: 262.1 },
    { date: 'Aug 26', close: 245.4 },
    { date: 'Sep 26', close: 250.6 },
    { date: 'Oct 26', close: 254.2 },
  ]
};

export const MARKET_WATCHLIST: StockQuote[] = [
  TSLA_QUOTE,
  {
    symbol: 'SPY',
    companyName: 'SPDR S&P 500 ETF Trust',
    price: 582.40,
    change: +3.20,
    changePercent: +0.55,
    marketCap: '$580B',
    peRatio: 26.8,
    high52Week: 586.20,
    low52Week: 410.50,
    volume: '52.1M',
    updatedAt: '2026-10-28 16:00 EST',
    history: [
      { date: 'Jun', close: 546 },
      { date: 'Jul', close: 552 },
      { date: 'Aug', close: 560 },
      { date: 'Sep', close: 574 },
      { date: 'Oct', close: 582.4 }
    ]
  },
  {
    symbol: 'QQQ',
    companyName: 'Invesco QQQ Trust (Nasdaq 100)',
    price: 494.10,
    change: +4.90,
    changePercent: +1.00,
    marketCap: '$285B',
    peRatio: 31.4,
    high52Week: 503.20,
    low52Week: 350.10,
    volume: '39.8M',
    updatedAt: '2026-10-28 16:00 EST',
    history: [
      { date: 'Jun', close: 470 },
      { date: 'Jul', close: 482 },
      { date: 'Aug', close: 478 },
      { date: 'Sep', close: 488 },
      { date: 'Oct', close: 494.1 }
    ]
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    price: 139.50,
    change: +2.15,
    changePercent: +1.57,
    marketCap: '$3.42T',
    peRatio: 52.1,
    high52Week: 144.40,
    low52Week: 40.20,
    volume: '112.5M',
    updatedAt: '2026-10-28 16:00 EST',
    history: [
      { date: 'Jun', close: 125 },
      { date: 'Jul', close: 118 },
      { date: 'Aug', close: 124 },
      { date: 'Sep', close: 132 },
      { date: 'Oct', close: 139.5 }
    ]
  }
];

export const INVESTMENT_MODULES = [
  {
    id: 'compound-interest',
    title: 'The Compound Growth Principle',
    summary: 'How reinvested capital and exponential time horizons generate long-term financial independence.',
    keyPoints: [
      'Interest earned begins earning interest on itself, forming an accelerating geometric curve.',
      'Starting early produces far larger outcomes than contributing higher sums late in life.',
      'Rule of 72: Divide 72 by the annual expected return rate to approximate doubling periods.'
    ]
  },
  {
    id: 'stocks-vs-bonds',
    title: 'Equities vs Fixed Income & Cash',
    summary: 'Distinguishing business ownership shares from contractual debt instruments and liquidity.',
    keyPoints: [
      'Equities represent proportional fractional ownership in operating commercial enterprises.',
      'Bonds are loan obligations issued by governments or corporations paying regular yield coupons.',
      'A balanced asset allocation mitigates volatility during standard economic down-cycles.'
    ]
  },
  {
    id: 'diversification-risk',
    title: 'Systematic Risk & Non-Correlated Allocation',
    summary: 'Why concentrated single-stock bets introduce uncompensated idiosyncratic peril.',
    keyPoints: [
      'Broad index funds (e.g. S&P 500, Total World) eliminate individual company bankruptcy risk.',
      'Dollar-cost averaging (DCA) buffers against behavioral errors and market timing mistakes.',
      'Always maintain an emergency liquid reserve of 3 to 6 months before funding long-term equities.'
    ]
  },
  {
    id: 'scam-detection',
    title: 'Recognizing Financial Fraud & Fake Promises',
    summary: 'Critical red flags that distinguish authentic regulated investing from criminal schemes.',
    keyPoints: [
      'Guaranteed returns do not exist in public capital markets; any guarantee is a structural fraud indicator.',
      'Elon Musk, Tesla, or SpaceX do not operate public crypto giveaway pools or direct deposit programs.',
      'Never send funds via cryptocurrency or wire transfers to accounts or individuals met on social platforms.'
    ]
  }
];

export const REGULATED_INSTITUTIONS = [
  {
    name: 'Fidelity Investments',
    regulatoryBody: 'SEC / FINRA (USA)',
    category: 'Full-Service Brokerage & Index Funds',
    website: 'https://www.fidelity.com'
  },
  {
    name: 'Charles Schwab',
    regulatoryBody: 'SEC / FINRA (USA)',
    category: 'Discount Brokerage & Retirement IRAs',
    website: 'https://www.schwab.com'
  },
  {
    name: 'The Vanguard Group',
    regulatoryBody: 'SEC / FINRA (USA)',
    category: 'Low-Cost Mutual Funds & ETFs',
    website: 'https://investor.vanguard.com'
  },
  {
    name: 'Interactive Brokers',
    regulatoryBody: 'FCA / SEC / BaFin / ASIC (Global)',
    category: 'Global Equities, Options & Currencies',
    website: 'https://www.interactivebrokers.com'
  }
];
