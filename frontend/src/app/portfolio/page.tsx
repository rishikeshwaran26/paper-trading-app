'use client';

import { Wallet, BarChart3, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatSignedCurrency, formatPercent, formatQuantity } from '@/lib/utils/formatters';

const MOCK = {
  portfolio: { initialCapital: 200000, availableCash: 64993.47, invested: 103663.50, currentValue: 122960.00, unrealizedPL: 19296.50, unrealizedPLPercent: 18.61, realizedPL: 2473.00, realizedPLPercent: 2.39 },
  sectorAllocation: [
    { sector: 'Oil & Gas', invested: 36757.50, currentValue: 40200.00, pl: 3442.50, plPercent: 9.36 },
    { sector: 'IT', invested: 74506.50, currentValue: 80250.00, pl: 5743.50, plPercent: 7.71 },
    { sector: 'Banking', invested: 66000.00, currentValue: 70710.00, pl: 4710.00, plPercent: 7.14 },
  ],
  holdings: [
    { symbol: 'RELIANCE', sector: 'Oil & Gas', quantity: 15, avgPrice: 2450.50, invested: 36757.50, ltp: 2680.00, currentValue: 40200.00, pl: 3442.50, plPercent: 9.36 },
    { symbol: 'TCS', sector: 'IT', quantity: 10, avgPrice: 3500.65, invested: 35006.50, ltp: 3800.00, currentValue: 38000.00, pl: 2993.50, plPercent: 8.55 },
    { symbol: 'INFY', sector: 'IT', quantity: 25, avgPrice: 1580.00, invested: 39500.00, ltp: 1690.00, currentValue: 42250.00, pl: 2750.00, plPercent: 6.96 },
    { symbol: 'HDFCBANK', sector: 'Banking', quantity: 20, avgPrice: 1620.00, invested: 32400.00, ltp: 1750.50, currentValue: 35010.00, pl: 2610.00, plPercent: 8.06 },
    { symbol: 'ICICIBANK', sector: 'Banking', quantity: 30, avgPrice: 1120.00, invested: 33600.00, ltp: 1190.00, currentValue: 35700.00, pl: 2100.00, plPercent: 6.25 },
  ],
  recentRealizedTrades: [
    { symbol: 'INFY', date: '2026-06-07', qty: 10, buyPrice: 1580.00, sellPrice: 1690.00, pl: 1100.00 },
  ],
};

const totalInvested = MOCK.sectorAllocation.reduce((s, x) => s + x.invested, 0);

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function PortfolioPage() {
  const p = MOCK.portfolio;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Capital, holdings, and allocation.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Initial Capital" value={formatCurrency(p.initialCapital)} icon={<IndianRupee className="h-5 w-5" />} />
        <StatCard label="Available Cash" value={formatCurrency(p.availableCash)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Total Invested" value={formatCurrency(p.invested)} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard
          label="Current Value"
          value={formatCurrency(p.currentValue)}
          change={p.unrealizedPLPercent}
          variant={p.unrealizedPL >= 0 ? 'profit' : 'loss'}
          icon={p.unrealizedPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
      </div>

      <Card title="Sector Allocation" subtitle="How your capital is distributed">
        <div className="space-y-4">
          {MOCK.sectorAllocation.map((s) => (
            <div key={s.sector}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{s.sector}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400">{formatCurrency(s.invested)}</span>
                  <span className={`w-20 text-right font-medium ${s.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatSignedCurrency(s.pl)}
                  </span>
                </div>
              </div>
              <ProgressBar value={s.invested} max={totalInvested} color="bg-blue-500" />
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                {((s.invested / totalInvested) * 100).toFixed(1)}% of invested &middot; {formatPercent(s.plPercent)} return
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Holdings" subtitle={`${MOCK.holdings.length} positions`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Symbol', 'Qty', 'Avg', 'Invested', 'LTP', 'Current', 'P&L', 'Return'].map((h) => (
                  <th key={h} className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${h !== 'Symbol' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {MOCK.holdings.map((h) => (
                <tr key={h.symbol} className="text-sm">
                  <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{h.symbol}</td>
                  <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">{formatQuantity(h.quantity)}</td>
                  <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(h.avgPrice)}</td>
                  <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(h.invested)}</td>
                  <td className="px-3 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(h.ltp)}</td>
                  <td className="px-3 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(h.currentValue)}</td>
                  <td className={`px-3 py-3 text-right font-medium ${h.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatSignedCurrency(h.pl)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Badge variant={h.pl >= 0 ? 'profit' : 'loss'} size="sm">{h.plPercent >= 0 ? '+' : ''}{h.plPercent.toFixed(2)}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Unrealized P&L"
          value={formatSignedCurrency(p.unrealizedPL)}
          change={p.unrealizedPLPercent}
          variant={p.unrealizedPL >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          label="Realized P&L"
          value={formatSignedCurrency(p.realizedPL)}
          change={p.realizedPLPercent}
          variant={p.realizedPL >= 0 ? 'profit' : 'loss'}
        />
      </div>
    </div>
  );
}
