'use client';

import { useState } from 'react';
import { Plus, Trash2, Target, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatSignedCurrency, formatPercent, formatQuantity } from '@/lib/utils/formatters';
import { useHoldings } from '@/hooks/useHoldings';
import { useBuyTrade, useSellTrade } from '@/hooks/useTrades';
import { useToast } from '@/providers';
import { ApiRequestError } from '@/lib/api';

export default function PositionsPage() {
  const { data: holdings, isLoading, error } = useHoldings();
  const buyMutation = useBuyTrade();
  const sellMutation = useSellTrade();
  const { addToast } = useToast();
  const [sellSymbol, setSellSymbol] = useState('');
  const [sellQty, setSellQty] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [showSellForm, setShowSellForm] = useState(false);

  const handleSell = async () => {
    if (!sellSymbol || !sellQty || !sellPrice) return;
    try {
      const result = await sellMutation.mutateAsync({ symbol: sellSymbol.toUpperCase(), quantity: Number(sellQty), price: Number(sellPrice) });
      addToast('success', `Sold ${sellQty} ${sellSymbol.toUpperCase()} — P&L ${result.realized_pnl.realized_pnl >= 0 ? '+' : ''}${result.realized_pnl.realized_pnl.toFixed(2)}`);
      setSellSymbol(''); setSellQty(''); setSellPrice(''); setShowSellForm(false);
    } catch (err) {
      addToast('error', err instanceof ApiRequestError ? err.message : 'Sell failed');
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Open Positions</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Failed to load positions: {(error as ApiRequestError).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Open Positions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage active holdings, stop losses, and targets.</p>
        </div>
        <button onClick={() => setShowSellForm(!showSellForm)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          {showSellForm ? 'Cancel' : 'Sell'}
        </button>
      </div>

      {showSellForm && (
        <Card title="Sell Shares">
          <div className="flex flex-wrap items-end gap-3">
            <input type="text" placeholder="Symbol" value={sellSymbol} onChange={e => setSellSymbol(e.target.value.toUpperCase())} className="flex-1 min-w-[120px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            <input type="number" placeholder="Qty" value={sellQty} onChange={e => setSellQty(e.target.value)} className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            <input type="number" step="0.01" placeholder="Price" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            <button onClick={handleSell} disabled={sellMutation.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {sellMutation.isPending ? 'Selling...' : 'Execute Sell'}
            </button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : !holdings || holdings.length === 0 ? (
        <Card><p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No open positions. Buy shares to get started.</p></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {holdings.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.symbol}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(p.ltp)}</p>
                  <p className={`text-sm font-medium ${p.unrealized_pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatSignedCurrency(p.unrealized_pl)} ({formatPercent(p.unrealized_pl_percent)})
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p><p className="font-medium text-gray-900 dark:text-white">{formatQuantity(p.quantity)}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Avg Cost</p><p className="font-medium text-gray-900 dark:text-white">{formatCurrency(p.average_buy_price)}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Current Value</p><p className="font-medium text-gray-900 dark:text-white">{formatCurrency(p.current_value)}</p></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300"><Target className="h-4 w-4 text-emerald-500" /> Targets</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">No targets set</p>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300"><Shield className="h-4 w-4 text-red-500" /> Stop Loss</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">No stop loss set</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
