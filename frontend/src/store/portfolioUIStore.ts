// Portfolio-focused UI state: selected view, date ranges
export interface PortfolioUIState {
  selectedView: 'holdings' | 'history' | 'charges';
  dateRange: { from: string; to: string };
  setView: (view: string) => void;
  setDateRange: (from: string, to: string) => void;
}
