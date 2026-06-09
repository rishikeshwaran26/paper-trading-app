import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const QUERY_KEY = ['dashboard'];

type DashboardData = {
  portfolio: import('@/types').Portfolio | null;
  top_holdings: import('@/types').Holding[];
  recent_trades: import('@/types').Trade[];
  watchlist_count: number;
  active_alerts_count: number;
  open_positions_count: number;
};

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.get<DashboardData>('/dashboard')
  });
}
