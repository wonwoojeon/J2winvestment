export interface Stock {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface PsychologyCheck {
  fearGreedIndex: number;
  creditConcern?: boolean;
  confidenceLevel?: string;
  m2MoneySupply?: string;
  marketFear?: boolean;
  overconfidence?: boolean;
  fomo?: boolean;
  emotionalTrading?: boolean;
  planDeviation?: boolean;
  marketSentiments?: string[];
}

export interface InvestmentJournal {
  id: string;
  date: string;
  totalAssets: number;
  foreignStocks: Stock[];
  domesticStocks: Stock[];
  cash: {
    krw: number;
    usd: number;
  };
  cryptocurrency: Stock[];
  evaluation: number;
  trades: string;
  psychologyCheck: PsychologyCheck;
  bullMarketChecklist: ChecklistItem[];
  bearMarketChecklist: ChecklistItem[];
  marketIssues: string;
  memo: string;
  total_assets?: number; // v27 호환성
  bull_market_checklist?: ChecklistItem[];
  bear_market_checklist?: ChecklistItem[];
}