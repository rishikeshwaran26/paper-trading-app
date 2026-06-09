import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const QUERY_KEY = ['dashboard'];

type DashboardData = {
  portfolio: import('@/types').Portfolio;
  holdings: import('@/types').Holding[];
  recentTrades: import('@/types').Trade[];
  activeAlertsCount: number;
};

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.get<DashboardData>('/dashboard')
  });
}
