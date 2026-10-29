export interface UserProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ScamType = 
  | 'Crypto / Impersonation Scam'
  | 'Phishing Link / Credential Stealer'
  | 'Fake Investment / Guaranteed ROI'
  | 'Social Media "Recovery Agent" Scam'
  | 'Wire Transfer / Fake Vendor Fraud'
  | 'SIM Swap / Unauthorized Account Takeover'
  | 'Other Cyber Fraud';

export type PaymentMethod = 
  | 'Cryptocurrency (BTC/ETH/USDT/Solana)'
  | 'Bank Wire Transfer'
  | 'Credit / Debit Card'
  | 'P2P Platform (Cash App, Zelle, PayPal)'
  | 'Gift Cards / Voucher'
  | 'Other';

export type ReportStatus = 
  | 'submitted'
  | 'under_review'
  | 'escalated'
  | 'closed';

export interface ScamReport {
  id: string;
  caseNumber: string;
  userId: string;
  userEmailOrName?: string;
  scamType: ScamType;
  amountLost: number;
  currency: string;
  incidentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  description: string;
  evidenceUrls: string[];
  status: ReportStatus;
  adminNotes?: string;
  officialGuidanceSteps?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars?: Record<string, string>;
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageAt: string;
  unreadCount?: Record<string, number>;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  imageUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface TeslaVehicle {
  id: string;
  name: string;
  tagline: string;
  priceUSD: number;
  rangeMiles: number;
  acceleration0to60: number; // in seconds
  topSpeedMph: number;
  peakPowerHp: number;
  seating: number;
  driveTrain: string;
  superchargingSpeed: string;
  image: string;
  gallery: string[];
  category: 'Sedan' | 'SUV' | 'Supercar' | 'Truck';
  officialTeslaUrl: string;
  specs: {
    weightLbs: number;
    cargoCuFt: number;
    powertrain: string;
    dragCoefficient: string;
  };
}

export interface StockQuote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  high52Week: number;
  low52Week: number;
  volume: string;
  updatedAt: string;
  history: { date: string; close: number }[];
}

export interface InvestmentGoal {
  startingBalance: number;
  monthlyContribution: number;
  annualInterestRate: number;
  years: number;
  compoundFrequency: number;
}
