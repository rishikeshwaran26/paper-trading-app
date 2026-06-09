import { apiClient } from './client';
import type { JournalEntry, JournalEntryDetail, CreateJournalEntryRequest } from '@/types';

export const journalApi = {
  getAll: (filters?: { symbol?: string; mood?: string; from?: string; to?: string }) =>
    apiClient.get<JournalEntry[]>('/journal', { params: filters as Record<string, string | undefined> }),
  getById: (id: number) => apiClient.get<JournalEntryDetail>(`/journal/${id}`),
  create: (data: CreateJournalEntryRequest) => apiClient.post<JournalEntry>('/journal', data),
  update: (id: number, data: Partial<CreateJournalEntryRequest>) => apiClient.put<JournalEntry>(`/journal/${id}`, data),
  delete: (id: number) => apiClient.del<{ message: string }>(`/journal/${id}`)
};
