export interface Portfolio {
  id: number; initial_capital: number; available_cash: number;
  invested_value: number; current_value: number;
  total_unrealized_pl: number; total_unrealized_pl_percent: number; total_realized_pl: number;
}
export interface PortfolioCapitalRequest { initial_capital: number }
