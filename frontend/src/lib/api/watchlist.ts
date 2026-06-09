import { apiClient } from './client';
import type { StockWithPrice } from '@/types';

export const watchlistApi = {
  getAll: () => apiClient.get<StockWithPrice[]>('/watchlist'),
  add: (symbol: string) => apiClient.post<StockWithPrice>('/watchlist', { symbol }),
  remove: (id: number) => apiClient.del<{ message: string }>(`/watchlist/${id}`)
};
