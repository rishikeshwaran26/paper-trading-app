'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatSignedCurrency, formatPercent, formatDate, formatQuantity } from '@/lib/utils/formatters';
import { useStockDetail } from '@/hooks/useStock';
import { useBuyTrade, useSellTrade, useTrades } from '@/hooks/useTrades';
import { ApiRequestError } from '@/lib/api';

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();

  const { data: stock, isLoading, error } = useStockDetail(symbol);
  const { data: trades } = useTrades({ symbol });
  const buyMutation = useBuyTrade();
  const sellMutation = useSellTrade();

  const [tradeQty, setTradeQty] = useState('');
  const [tradePrice, setTradePrice] = useState('');

  const handleBuy = async () => {
    if (!tradeQty || !tradePrice) return;
    try {
      await buyMutation.mutateAsync({ symbol, quantity: Number(tradeQty), price: Number(tradePrice) });
      setTradeQty(''); setTradePrice('');
    } catch {}
  };

  const handleSell = async () => {
    if (!tradeQty || !tradePrice) return;
    try {
      await sellMutation.mutateAsync({ symbol, quantity: Number(tradeQty), price: Number(tradePrice) });
      setTradeQty(''); setTradePrice('');
    } catch {}
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{(error as ApiRequestError).code === 'NOT_FOUND' ? 'Stock not found' : 'Failed to load stock details'}</p>
        <Link href="/watchlist" className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"><ArrowLeft className="h-4 w-4" /> Back to Watchlist</Link>
      </div>
    );
  }

  const isUp = stock ? stock.change_percent > 0 : false;
  const isDown = stock ? stock.change_percent < 0 : false;

  return (
    <div className="space-y-6">
      <Link href="/watchlist" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><ArrowLeft className="h-4 w-4" /> Back to Watchlist</Link>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}
          </div>
        </div>
      ) : stock ? (
        <>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
              <Badge variant={isUp ? 'profit' : isDown ? 'loss' : 'neutral'}>{formatPercent(stock.change_percent)}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="LTP" value={formatCurrency(stock.ltp)} />
            <StatCard label="Change" value={formatSignedCurrency(stock.change)} change={stock.change_percent} variant={isUp ? 'profit' : isDown ? 'loss' : 'default'} />
            <StatCard label="Day Range" value={`${formatCurrency(stock.day_low)} – ${formatCurrency(stock.day_high)}`} />
            <StatCard label="Volume" value={`${(stock.volume / 10000000).toFixed(1)}Cr`} />
          </div>

          <Card title="Trade">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[100px]">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Quantity</label>
                <input type="number" placeholder="Qty" value={tradeQty} onChange={e => setTradeQty(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Price (₹)</label>
                <input type="number" step="0.01" placeholder="Price" value={tradePrice} onChange={e => setTradePrice(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <button onClick={handleBuy} disabled={buyMutation.isPending || !tradeQty || !tradePrice} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                {buyMutation.isPending ? 'Buying...' : 'Buy'}
              </button>
              <button onClick={handleSell} disabled={sellMutation.isPending || !tradeQty || !tradePrice} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {sellMutation.isPending ? 'Selling...' : 'Sell'}
              </button>
            </div>
            {buyMutation.error && <p className="mt-2 text-sm text-red-600">{(buyMutation.error as ApiRequestError).message}</p>}
            {sellMutation.error && <p className="mt-2 text-sm text-red-600">{(sellMutation.error as ApiRequestError).message}</p>}
            {buyMutation.data && <p className="mt-2 text-sm text-emerald-600">Buy executed! Holding: {buyMutation.data.holding.quantity} shares</p>}
            {sellMutation.data && <p className="mt-2 text-sm text-emerald-600">Sell executed! P&L: {formatSignedCurrency(sellMutation.data.realized_pnl.realized_pnl)}</p>}
          </Card>

          <Card title="Trades" subtitle={`${trades?.length ?? 0} transactions`}>
            {trades && trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {['Date', 'Type', 'Qty', 'Price'].map((h) => (
                        <th key={h} className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${h !== 'Date' && h !== 'Type' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {trades.map((t) => (
                      <tr key={t.id} className="text-sm">
                        <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatDate(t.trade_date)}</td>
                        <td className="px-3 py-3"><Badge variant={t.trade_type === 'BUY' ? 'active' : 'loss'} size="sm">{t.trade_type}</Badge></td>
                        <td className="px-3 py-3 text-right text-gray-900 dark:text-white">{formatQuantity(t.quantity)}</td>
                        <td className="px-3 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(t.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">No trades for this stock yet.</p>}
          </Card>
        </>
      ) : null}
    </div>
  );
}
