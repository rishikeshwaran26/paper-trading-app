export interface Portfolio {
  id: number; initial_capital: number; available_cash: number;
  total_invested: number; current_holdings_value: number; current_portfolio_value: number;
  unrealized_pnl: number; unrealized_pnl_percent: number; realized_pnl: number;
  total_return: number; total_return_percent: number; total_charges: number;
  holdings_count: number; created_at: string; updated_at: string;
}
export interface PortfolioCapitalRequest { initial_capital: number }
