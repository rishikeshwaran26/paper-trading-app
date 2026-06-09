import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '@/lib/api';

const QUERY_KEY = ['portfolio'];

export function usePortfolio() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => portfolioApi.getSummary()
  });
}

export function useDetailedPortfolio() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detailed'],
    queryFn: () => portfolioApi.getDetailed()
  });
}

export function useSetCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (initialCapital: number) => portfolioApi.setCapital(initialCapital),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  });
}
