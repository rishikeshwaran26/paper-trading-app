import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '@/lib/api';

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['stocks', 'search', query],
    queryFn: () => stocksApi.search(query),
    enabled: query.length >= 1
  });
}

export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: ['stocks', symbol],
    queryFn: () => stocksApi.getBySymbol(symbol),
    enabled: !!symbol
  });
}

export function useStockPriceHistory(symbol: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['stocks', symbol, 'price-history', from, to],
    queryFn: () => stocksApi.getPriceHistory(symbol, from, to),
    enabled: !!symbol
  });
}
