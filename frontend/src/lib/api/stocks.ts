import { apiClient } from './client';
import type { StockWithPrice } from '@/types';

export const stocksApi = {
  search: (query: string) => apiClient.get<StockWithPrice[]>('/stocks', { params: { q: query } }),
  getBySymbol: (symbol: string) => apiClient.get<StockWithPrice>(`/stocks/${symbol}`),
  getPriceHistory: (symbol: string, from?: string, to?: string) =>
    apiClient.get<{ date: string; open: number; high: number; low: number; close: number; volume: number }[]>(
      `/stocks/${symbol}/price-history`,
      { params: { from, to } }
    )
};
