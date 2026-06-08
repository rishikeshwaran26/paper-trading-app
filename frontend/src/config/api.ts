// Base URL and endpoint path constants
export const API_BASE_URL = '';
export const ENDPOINTS = {
  DASHBOARD: '/dashboard',
  PORTFOLIO: '/portfolio',
  PORTFOLIO_DETAILED: '/portfolio/detailed',
  PORTFOLIO_CAPITAL: '/portfolio/capital',
  HOLDINGS: '/holdings',
  TRADES: '/trades',
  TRADES_BUY: '/trades/buy',
  TRADES_SELL: '/trades/sell',
  TARGETS_BY_HOLDING: (id: number) => `/targets/holdings/${id}`,
  STOPLOSSES_BY_HOLDING: (id: number) => `/stop-losses/holdings/${id}`,
  ALERTS: '/alerts',
  WATCHLIST: '/watchlist',
  STOCKS: '/stocks',
  STOCK_BY_SYMBOL: (s: string) => `/stocks/${s}`,
  STOCK_PRICE_HISTORY: (s: string) => `/stocks/${s}/price-history`,
  JOURNAL: '/journal'
} as const;
