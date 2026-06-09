'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Minus, StickyNote } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

const MOCK_WATCHLIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', ltp: 2680.00, change: 61.30, changePercent: 2.34, dayHigh: 2700.00, dayLow: 2640.00, volume: 12500000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', ltp: 3800.00, change: 68.40, changePercent: 1.82, dayHigh: 3820.00, dayLow: 3750.00, volume: 3200000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', ltp: 1750.50, change: -12.25, changePercent: -0.69, dayHigh: 1770.00, dayLow: 1740.00, volume: 8900000 },
  { symbol: 'INFY', name: 'Infosys Ltd', ltp: 1690.00, change: 28.75, changePercent: 1.72, dayHigh: 1700.00, dayLow: 1660.00, volume: 5600000 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', ltp: 1190.00, change: 5.95, changePercent: 0.50, dayHigh: 1200.00, dayLow: 1180.00, volume: 7800000 },
  { symbol: 'SBIN', name: 'State Bank of India', ltp: 845.50, change: -4.50, changePercent: -0.53, dayHigh: 855.00, dayLow: 840.00, volume: 15000000 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', ltp: 1450.00, change: 35.00, changePercent: 2.47, dayHigh: 1460.00, dayLow: 1420.00, volume: 4100000 },
];

export default function WatchlistPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_WATCHLIST.filter(
    (s) =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Stocks you are monitoring with live prices.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Symbol', 'Name', 'LTP', 'Change', 'Day High', 'Day Low', 'Volume', ''].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
                      h === 'LTP' || h === 'Change' || h === 'Day High' || h === 'Day Low' || h === 'Volume' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filtered.map((s) => {
                const isUp = s.changePercent > 0;
                const isDown = s.changePercent < 0;
                return (
                  <tr
                    key={s.symbol}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/stocks/${s.symbol}`}
                        className="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                      >
                        {s.symbol}
                      </Link>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(s.ltp)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        isUp ? 'text-emerald-600 dark:text-emerald-400' : isDown ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
                      }`}>
                        {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : isDown ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                        {formatPercent(s.changePercent)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(s.dayHigh)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(s.dayLow)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                      {(s.volume / 10000000).toFixed(1)}Cr
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                        <StickyNote className="h-4 w-4" />
                      </button>
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
