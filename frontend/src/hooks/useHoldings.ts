import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { holdingsApi } from '@/lib/api';

const QUERY_KEY = ['holdings'];

export function useHoldings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => holdingsApi.getAll()
  });
}

export function useHoldingDetail(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => holdingsApi.getById(id),
    enabled: !!id
  });
}

export function useClosePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => holdingsApi.closePosition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}
