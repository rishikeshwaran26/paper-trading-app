'use client';

import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, BarChart3, Bell, ArrowRightLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { formatCurrency, formatSignedCurrency, formatPercent, formatDate, formatQuantity } from '@/lib/utils/formatters';
import { useDashboard } from '@/hooks/useDashboard';
import { useBuyTrade, useSellTrade } from '@/hooks/useTrades';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const buyMutation = useBuyTrade();
  const sellMutation = useSellTrade();
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeQty, setTradeQty] = useState('');
  const [tradePrice, setTradePrice] = useState('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [showTradeForm, setShowTradeForm] = useState(false);

  const p = data?.portfolio;
  const holdings = data?.top_holdings ?? [];
  const recentTrades = data?.recent_trades ?? [];
  const activeAlertsCount = data?.active_alerts_count ?? 0;

  const handleTrade = async () => {
    if (!tradeSymbol || !tradeQty || !tradePrice) return;
    const payload = { symbol: tradeSymbol.toUpperCase(), quantity: Number(tradeQty), price: Number(tradePrice) };
    try {
      if (tradeType === 'BUY') await buyMutation.mutateAsync(payload);
      else await sellMutation.mutateAsync(payload);
      setTradeSymbol(''); setTradeQty(''); setTradePrice('');
      setShowTradeForm(false);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Portfolio overview and market summary</p>
        </div>
        <button
          onClick={() => setShowTradeForm(!showTradeForm)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <ArrowRightLeft className="h-4 w-4" /> {showTradeForm ? 'Close' : 'Quick Trade'}
        </button>
      </div>

      {showTradeForm && (
        <Card title="Quick Trade">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex gap-1.5">
              <button onClick={() => setTradeType('BUY')} className={`rounded-lg px-3 py-2 text-sm font-medium ${tradeType === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>BUY</button>
              <button onClick={() => setTradeType('SELL')} className={`rounded-lg px-3 py-2 text-sm font-medium ${tradeType === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>SELL</button>
            </div>
            <div className="flex-1 min-w-[120px]"><input type="text" placeholder="Symbol" value={tradeSymbol} onChange={e => setTradeSymbol(e.target.value.toUpperCase())} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
            <div className="w-24"><input type="number" placeholder="Qty" value={tradeQty} onChange={e => setTradeQty(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
            <div className="w-32"><input type="number" step="0.01" placeholder="Price" value={tradePrice} onChange={e => setTradePrice(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
            <button onClick={handleTrade} disabled={buyMutation.isPending || sellMutation.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {buyMutation.isPending || sellMutation.isPending ? 'Executing...' : `Place ${tradeType}`}
            </button>
          </div>
          {(buyMutation.error || sellMutation.error) && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{(buyMutation.error ?? sellMutation.error)?.message}</p>
          )}
          {(buyMutation.data || sellMutation.data) && (
            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{tradeType} order executed successfully</p>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Available Cash" value={p ? formatCurrency(p.available_cash) : '-'} icon={<Wallet className="h-5 w-5" />} loading={isLoading} />
        <StatCard label="Total Invested" value={p ? formatCurrency(p.total_invested) : '-'} icon={<BarChart3 className="h-5 w-5" />} loading={isLoading} />
        <StatCard label="Unrealized P&L" value={p ? formatSignedCurrency(p.unrealized_pnl) : '-'} change={p?.unrealized_pnl_percent} variant={(p?.unrealized_pnl ?? 0) >= 0 ? 'profit' : 'loss'} icon={(p?.unrealized_pnl ?? 0) >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />} loading={isLoading} />
        <StatCard label="Realized P&L" value={p ? formatSignedCurrency(p.realized_pnl) : '-'} variant={(p?.realized_pnl ?? 0) >= 0 ? 'profit' : 'loss'} loading={isLoading} />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Failed to load dashboard: {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Top Holdings" subtitle="Your largest positions">
          <DataTable
            columns={[
              { key: 'symbol', header: 'Symbol', render: (h: any) => <div><span className="font-medium text-gray-900 dark:text-white">{h.symbol}</span><span className="ml-2 text-xs text-gray-400">{h.quantity} shares</span></div> },
              { key: 'ltp', header: 'LTP', align: 'right', render: (h: any) => <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(h.ltp)}</span> },
              { key: 'total_invested', header: 'Invested', align: 'right', render: (h: any) => <span className="text-gray-600 dark:text-gray-400">{formatCurrency(h.total_invested)}</span> },
              { key: 'current_value', header: 'Current', align: 'right', render: (h: any) => <span className="text-gray-900 dark:text-white">{formatCurrency(h.current_value)}</span> },
              { key: 'unrealized_pl', header: 'P&L', align: 'right', render: (h: any) => <span className={h.unrealized_pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{formatSignedCurrency(h.unrealized_pl)}<span className="ml-1 text-xs">({formatPercent(h.unrealized_pl_percent)})</span></span> }
            ]}
            data={holdings}
            keyExtractor={(h: any) => h.id}
            loading={isLoading}
          />
        </Card>

        <Card title="Recent Trades" subtitle="Last transactions">
          <DataTable
            columns={[
              { key: 'trade_date', header: 'Date', render: (t: any) => <span className="text-gray-600 dark:text-gray-400">{formatDate(t.trade_date)}</span> },
              { key: 'symbol', header: 'Symbol', render: (t: any) => <span className="font-medium text-gray-900 dark:text-white">{t.symbol}</span> },
              { key: 'trade_type', header: 'Type', align: 'center', render: (t: any) => <Badge variant={t.trade_type === 'BUY' ? 'profit' : 'loss'} size="sm">{t.trade_type}</Badge> },
              { key: 'quantity', header: 'Qty', align: 'right', render: (t: any) => <span className="text-gray-900 dark:text-white">{formatQuantity(t.quantity)}</span> },
              { key: 'price', header: 'Price', align: 'right', render: (t: any) => <span className="text-gray-900 dark:text-white">{formatCurrency(t.price)}</span> }
            ]}
            data={recentTrades}
            keyExtractor={(t: any) => t.id}
            loading={isLoading}
          />
        </Card>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <Bell className="h-5 w-5 text-gray-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Price alerts are checked every minute. You have <span className="font-medium text-gray-900 dark:text-white">{activeAlertsCount} active</span> alerts.
        </p>
      </div>
    </div>
  );
}
