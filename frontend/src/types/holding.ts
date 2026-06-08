export interface Holding {
  id: number; portfolio_id: number; stock_id: number; symbol: string; name: string;
  quantity: number; average_buy_price: number; total_invested: number; total_buy_charges: number;
  ltp: number; current_value: number; unrealized_pl: number; unrealized_pl_percent: number;
  day_change_percent: number; first_bought_at: string;
}
export interface HoldingDetail extends Holding { targets: Target[]; stop_losses: StopLoss[] }
export interface Target { id: number; holding_id: number; stock_id: number; target_price: number; quantity: number | null; is_achieved: boolean; achieved_at: string | null; created_at: string }
export interface StopLoss { id: number; holding_id: number; stock_id: number; stop_price: number; quantity: number | null; is_triggered: boolean; triggered_at: string | null; created_at: string }
