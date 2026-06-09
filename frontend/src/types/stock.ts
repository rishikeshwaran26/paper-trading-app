export interface Stock { id: number; symbol: string; name: string; isin: string; series: string; exchange: string; sector: string | null; industry: string | null; face_value: number | null }
export interface StockWithPrice extends Stock { ltp: number; change: number; change_percent: number; day_high: number; day_low: number; volume: number; watchlist_id?: number | null }
export interface StockNote { id: number; stock_id: number; title: string | null; content: string | null; created_at: string; updated_at: string }
