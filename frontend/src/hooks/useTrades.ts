import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradesApi } from '@/lib/api';
import type { BuyTradeRequest, SellTradeRequest } from '@/types';

const QUERY_KEY = ['trades'];

export function useTrades(filters?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => tradesApi.getAll(filters as Parameters<typeof tradesApi.getAll>[0])
  });
}

export function useTradeDetail(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => tradesApi.getById(id),
    enabled: !!id
  });
}

export function useBuyTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BuyTradeRequest) => tradesApi.buy(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      qc.invalidateQueries({ queryKey: ['holdings'] });
      qc.invalidateQueries({ queryKey: ['trades'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useSellTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SellTradeRequest) => tradesApi.sell(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      qc.invalidateQueries({ queryKey: ['holdings'] });
      qc.invalidateQueries({ queryKey: ['trades'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}
