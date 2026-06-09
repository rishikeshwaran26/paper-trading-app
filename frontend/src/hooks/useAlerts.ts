import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api';
import type { CreateAlertRequest } from '@/types';

const QUERY_KEY = ['alerts'];

export function useAlerts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => alertsApi.getAll()
  });
}

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAlertRequest) => alertsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}

export function useToggleAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertsApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}
