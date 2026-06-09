import { apiClient } from './client';
import type { Trade, BuyTradeRequest, SellTradeRequest, BuyTradeResult, SellTradeResult } from '@/types';

export const tradesApi = {
  buy: (data: BuyTradeRequest) => apiClient.post<BuyTradeResult>('/trades/buy', data),
  sell: (data: SellTradeRequest) => apiClient.post<SellTradeResult>('/trades/sell', data),
  getAll: (filters?: { symbol?: string; trade_type?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiClient.get<Trade[]>('/trades', { params: filters as Record<string, string | number | undefined> }),
  getById: (id: number) => apiClient.get<Trade>(`/trades/${id}`)
};
