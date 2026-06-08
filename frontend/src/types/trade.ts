export interface Trade { id: number; portfolio_id: number; stock_id: number; symbol: string; trade_type: 'BUY' | 'SELL'; quantity: number; price: number; total_value: number; trade_date: string; notes: string | null; created_at: string }
export interface TradeCharges { brokerage: number; stt: number; exchange_charges: number; gst: number; sebi_charges: number; stamp_duty: number; total_charges: number }
export interface BuyTradeRequest { symbol: string; quantity: number; price: number; trade_date?: string; notes?: string; target_price?: number; stop_loss?: number }
export interface SellTradeRequest { symbol: string; quantity: number; price: number; trade_date?: string; notes?: string }
export interface BuyTradeResult { trade: Trade; charges: TradeCharges; holding: Holding; portfolio: Portfolio }
export interface SellTradeResult { trade: Trade; charges: TradeCharges; realized_pnl: RealizedPnl; holding: Holding | null; portfolio: Portfolio }
export interface RealizedPnl { gross_proceeds: number; total_charges: number; net_proceeds: number; cost_basis: number; realized_pnl: number; realized_pnl_percent: number }
