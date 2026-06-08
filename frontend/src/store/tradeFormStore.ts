// Draft state for buy/sell forms before submission
export interface TradeFormState {
  symbol: string;
  quantity: number;
  price: number;
  tradeDate: string;
  notes: string;
  targetPrice: number | null;
  stopLoss: number | null;
  // Methods
  setField: <K extends keyof TradeFormState>(key: K, value: TradeFormState[K]) => void;
  reset: () => void;
}
