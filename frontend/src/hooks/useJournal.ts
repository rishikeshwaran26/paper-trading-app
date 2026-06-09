import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi } from '@/lib/api';
import type { CreateJournalEntryRequest } from '@/types';

const QUERY_KEY = ['journal'];

export function useJournalEntries(filters?: Record<string, string | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => journalApi.getAll(filters as Parameters<typeof journalApi.getAll>[0])
  });
}

export function useJournalEntry(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => journalApi.getById(id),
    enabled: !!id
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalEntryRequest) => journalApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}

export function useUpdateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateJournalEntryRequest> }) => journalApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => journalApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}
