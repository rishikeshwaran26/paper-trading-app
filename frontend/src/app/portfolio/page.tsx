'use client';

import { Wallet, BarChart3, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatSignedCurrency, formatPercent, formatQuantity } from '@/lib/utils/formatters';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useHoldings } from '@/hooks/useHoldings';
import { ApiRequestError } from '@/lib/api';

export default function PortfolioPage() {
  const { data: p, isLoading: pLoading, error: pError } = usePortfolio();
  const { data: holdings, isLoading: hLoading } = useHoldings();

  const isLoading = pLoading || hLoading;
  const error = pError;

  const sectorMap = new Map<string, { invested: number; currentValue: number; pl: number }>();
  for (const h of holdings ?? []) {
    const sector = 'sector' in h && (h as any).sector ? (h as any).sector : 'Other';
    const existing = sectorMap.get(sector) ?? { invested: 0, currentValue: 0, pl: 0 };
    existing.invested += h.total_invested;
    existing.currentValue += h.current_value;
    existing.pl += h.unrealized_pl;
    sectorMap.set(sector, existing);
  }

  const sectorAllocation = Array.from(sectorMap.entries()).map(([sector, v]) => ({
    sector, invested: v.invested, currentValue: v.currentValue, pl: v.pl, plPercent: v.invested > 0 ? (v.pl / v.invested) * 100 : 0
  }));
  const totalInvested = sectorAllocation.reduce((s, x) => s + x.invested, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Capital, holdings, and allocation.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Initial Capital" value={p ? formatCurrency(p.initial_capital) : '-'} icon={<IndianRupee className="h-5 w-5" />} loading={isLoading} />
        <StatCard label="Available Cash" value={p ? formatCurrency(p.available_cash) : '-'} icon={<Wallet className="h-5 w-5" />} loading={isLoading} />
        <StatCard label="Total Invested" value={p ? formatCurrency(p.invested_value) : '-'} icon={<BarChart3 className="h-5 w-5" />} loading={isLoading} />
        <StatCard label="Current Value" value={p ? formatCurrency(p.current_value) : '-'} change={p?.total_unrealized_pl_percent} variant={(p?.total_unrealized_pl ?? 0) >= 0 ? 'profit' : 'loss'} icon={(p?.total_unrealized_pl ?? 0) >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />} loading={isLoading} />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Failed to load portfolio: {(error as ApiRequestError).message}
        </div>
      )}

      {sectorAllocation.length > 0 && (
        <Card title="Sector Allocation" subtitle="How your capital is distributed">
          <div className="space-y-4">
            {sectorAllocation.map((s) => (
              <div key={s.sector}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{s.sector}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 dark:text-gray-400">{formatCurrency(s.invested)}</span>
                    <span className={`w-20 text-right font-medium ${s.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatSignedCurrency(s.pl)}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${totalInvested > 0 ? Math.min((s.invested / totalInvested) * 100, 100) : 0}%` }} />
                </div>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{((s.invested / totalInvested) * 100).toFixed(1)}% of invested &middot; {formatPercent(s.plPercent)} return</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Holdings" subtitle={`${holdings?.length ?? 0} positions`}>
        {holdings && holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Symbol', 'Qty', 'Avg', 'Invested', 'LTP', 'Current', 'P&L', 'Return'].map((h) => (
                    <th key={h} className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${h !== 'Symbol' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {holdings.map((h) => (
                  <tr key={h.id} className="text-sm">
                    <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{h.symbol}</td>
                    <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">{formatQuantity(h.quantity)}</td>
                    <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(h.average_buy_price)}</td>
                    <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(h.total_invested)}</td>
                    <td className="px-3 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(h.ltp)}</td>
                    <td className="px-3 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(h.current_value)}</td>
                    <td className={`px-3 py-3 text-right font-medium ${h.unrealized_pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatSignedCurrency(h.unrealized_pl)}</td>
                    <td className="px-3 py-3 text-right"><Badge variant={h.unrealized_pl >= 0 ? 'profit' : 'loss'} size="sm">{h.unrealized_pl_percent >= 0 ? '+' : ''}{h.unrealized_pl_percent.toFixed(2)}%</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !isLoading && <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">No holdings yet. Start trading!</p>
        )}
      </Card>

      {p && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Unrealized P&L" value={formatSignedCurrency(p.total_unrealized_pl)} change={p.total_unrealized_pl_percent} variant={p.total_unrealized_pl >= 0 ? 'profit' : 'loss'} />
          <StatCard label="Realized P&L" value={formatSignedCurrency(p.total_realized_pl)} variant={p.total_realized_pl >= 0 ? 'profit' : 'loss'} />
        </div>
      )}
    </div>
  );
}
