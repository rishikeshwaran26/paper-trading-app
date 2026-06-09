'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Minus, StickyNote, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchlist';
import { ApiRequestError } from '@/lib/api';

export default function WatchlistPage() {
  const { data: stocks, isLoading, error } = useWatchlist();
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();
  const [search, setSearch] = useState('');
  const [addSymbol, setAddSymbol] = useState('');

  const filtered = (stocks ?? []).filter(
    (s) => s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!addSymbol.trim()) return;
    try {
      await addMutation.mutateAsync(addSymbol.toUpperCase());
      setAddSymbol('');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Stocks you are monitoring with live prices.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Add symbol..." value={addSymbol} onChange={e => setAddSymbol(e.target.value.toUpperCase())} className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          <button onClick={handleAdd} disabled={addMutation.isPending} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Plus className="h-4 w-4" /> Add</button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search stocks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500" />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Failed to load watchlist: {(error as ApiRequestError).message ?? 'Unknown error'}
        </div>
      )}

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Symbol', 'Name', 'LTP', 'Change', 'Day High', 'Day Low', 'Volume', ''].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${h === 'LTP' || h === 'Change' || h === 'Day High' || h === 'Day Low' || h === 'Volume' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-5 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">No stocks in your watchlist</td></tr>
              ) : filtered.map((s) => {
                const isUp = s.change_percent > 0;
                const isDown = s.change_percent < 0;
                return (
                  <tr key={s.symbol} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3"><Link href={`/stocks/${s.symbol}`} className="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">{s.symbol}</Link></td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{s.name}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(s.ltp)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${isUp ? 'text-emerald-600 dark:text-emerald-400' : isDown ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                        {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : isDown ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                        {formatPercent(s.change_percent)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{formatCurrency(s.day_high)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{formatCurrency(s.day_low)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">{(s.volume / 10000000).toFixed(1)}Cr</td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"><StickyNote className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
