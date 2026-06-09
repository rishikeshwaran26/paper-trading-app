import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistApi } from '@/lib/api';

const QUERY_KEY = ['watchlist'];

export function useWatchlist() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => watchlistApi.getAll()
  });
}

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (symbol: string) => watchlistApi.add(symbol),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => watchlistApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}
