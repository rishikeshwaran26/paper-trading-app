import { apiClient } from './client';
import type { Alert, CreateAlertRequest } from '@/types';

export const alertsApi = {
  getAll: () => apiClient.get<Alert[]>('/alerts'),
  create: (data: CreateAlertRequest) => apiClient.post<Alert>('/alerts', data),
  update: (id: number, data: Partial<CreateAlertRequest>) => apiClient.put<Alert>(`/alerts/${id}`, data),
  toggleActive: (id: number) => apiClient.patch<Alert>(`/alerts/${id}/toggle`),
  delete: (id: number) => apiClient.del<{ message: string }>(`/alerts/${id}`)
};
