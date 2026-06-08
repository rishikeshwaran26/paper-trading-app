export interface Alert { id: number; user_id: number; stock_id: number; symbol: string; alert_type: 'ABOVE' | 'BELOW'; target_price: number; is_triggered: boolean; is_active: boolean; triggered_at: string | null; triggered_price: number | null; created_at: string }
export interface CreateAlertRequest { symbol: string; alert_type: 'ABOVE' | 'BELOW'; target_price: number }
