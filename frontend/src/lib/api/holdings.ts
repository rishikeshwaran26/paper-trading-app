import { apiClient } from './client';
import type { Holding, HoldingDetail } from '@/types';

export const holdingsApi = {
  getAll: () => apiClient.get<Holding[]>('/holdings'),
  getById: (id: number) => apiClient.get<HoldingDetail>(`/holdings/${id}`),
  closePosition: (id: number) => apiClient.del<{ message: string }>(`/holdings/${id}`)
};
