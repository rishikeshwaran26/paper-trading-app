import { apiClient } from './client';
import type { Portfolio } from '@/types';

export const portfolioApi = {
  getSummary: () => apiClient.get<import('@/types').Portfolio>('/portfolio'),
  getDetailed: () => apiClient.get<import('@/types').Portfolio & { holdings: import('@/types').Holding[] }>('/portfolio/detailed'),
  setCapital: (initialCapital: number) => apiClient.put<import('@/types').Portfolio>('/portfolio/capital', { initial_capital: initialCapital })
};
