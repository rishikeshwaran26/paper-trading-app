'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, History, StickyNote } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatSignedCurrency, formatPercent, formatDate, formatQuantity } from '@/lib/utils/formatters';

const MOCK_STOCKS: Record<string, {
  name: string; sector: string; industry: string; isin: string;
  ltp: number; change: number; changePercent: number; dayHigh: number; dayLow: number; volume: number;
  holding?: { quantity: number; avgPrice: number; currentValue: number; pl: number; plPercent: number };
  trades: { date: string; type: 'BUY' | 'SELL'; qty: number; price: number }[];
  notes: { id: number; content: string; date: string }[];
}> = {
  RELIANCE: {
    name: 'Reliance Industries Ltd', sector: 'Oil & Gas', industry: 'Refineries', isin: 'INE002A01018',
    ltp: 2680.00, change: 61.30, changePercent: 2.34, dayHigh: 2700.00, dayLow: 2640.00, volume: 12500000,
    holding: { quantity: 15, avgPrice: 2450.50, currentValue: 40200.00, pl: 3442.50, plPercent: 9.36 },
    trades: [
      { date: '2026-06-08', type: 'BUY', qty: 15, price: 2450.50 },
    ],
    notes: [
      { id: 1, content: 'Strong buy near support. Added at ₹2,450.', date: '2026-06-08' },
    ],
  },
  TCS: {
    name: 'Tata Consultancy Services Ltd', sector: 'IT', industry: 'Software', isin: 'INE467B01029',
    ltp: 3800.00, change: 68.40, changePercent: 1.82, dayHigh: 3820.00, dayLow: 3750.00, volume: 3200000,
    holding: { quantity: 10, avgPrice: 3500.65, currentValue: 38000.00, pl: 2993.50, plPercent: 8.55 },
    trades: [
      { date: '2026-06-08', type: 'BUY', qty: 10, price: 3500.65 },
    ],
    notes: [
      { id: 2, content: 'IT sector momentum. Results expected next month.', date: '2026-06-08' },
    ],
  },
  HDFCBANK: {
    name: 'HDFC Bank Ltd', sector: 'Banking', industry: 'Private Bank', isin: 'INE040A01034',
    ltp: 1750.50, change: -12.25, changePercent: -0.69, dayHigh: 1770.00, dayLow: 1740.00, volume: 8900000,
    holding: { quantity: 20, avgPrice: 1620.00, currentValue: 35010.00, pl: 2610.00, plPercent: 8.06 },
    trades: [
      { date: '2026-06-07', type: 'BUY', qty: 20, price: 1620.00 },
    ],
    notes: [
      { id: 3, content: 'Good support at ₹1,600. Banking sector outlook positive.', date: '2026-06-07' },
    ],
  },
  INFY: {
    name: 'Infosys Ltd', sector: 'IT', industry: 'Software', isin: 'INE009A01021',
    ltp: 1690.00, change: 28.75, changePercent: 1.72, dayHigh: 1700.00, dayLow: 1660.00, volume: 5600000,
    holding: { quantity: 25, avgPrice: 1580.00, currentValue: 42250.00, pl: 2750.00, plPercent: 6.96 },
    trades: [
      { date: '2026-06-07', type: 'BUY', qty: 25, price: 1580.00 },
      { date: '2026-06-07', type: 'SELL', qty: 10, price: 1690.00 },
    ],
    notes: [
      { id: 4, content: 'Added on dip. Partial profit booking at ₹1,690.', date: '2026-06-07' },
    ],
  },
  ICICIBANK: {
    name: 'ICICI Bank Ltd', sector: 'Banking', industry: 'Private Bank', isin: 'INE090A01021',
    ltp: 1190.00, change: 5.95, changePercent: 0.50, dayHigh: 1200.00, dayLow: 1180.00, volume: 7800000,
    holding: { quantity: 30, avgPrice: 1120.00, currentValue: 35700.00, pl: 2100.00, plPercent: 6.25 },
    trades: [
      { date: '2026-06-06', type: 'BUY', qty: 30, price: 1120.00 },
    ],
    notes: [
      { id: 5, content: 'Value buying after 5% correction. Target ₹1,300.', date: '2026-06-06' },
    ],
  },
};

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const stock = MOCK_STOCKS[symbol];

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Stock not found in your portfolio or watchlist.</p>
        <Link
          href="/watchlist"
          className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Watchlist
        </Link>
      </div>
    );
  }

  const isUp = stock.changePercent > 0;
  const isDown = stock.changePercent < 0;

  return (
    <div className="space-y-6">
      <Link
        href="/watchlist"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Watchlist
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}</h1>
          <Badge variant={isUp ? 'profit' : isDown ? 'loss' : 'neutral'}>
            {formatPercent(stock.changePercent)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="LTP" value={formatCurrency(stock.ltp)} />
        <StatCard
          label="Change"
          value={formatSignedCurrency(stock.change)}
          change={stock.changePercent}
          variant={isUp ? 'profit' : isDown ? 'loss' : 'default'}
        />
        <StatCard label="Day Range" value={`${formatCurrency(stock.dayLow)} – ${formatCurrency(stock.dayHigh)}`} />
        <StatCard label="Volume" value={`${(stock.volume / 10000000).toFixed(1)}Cr`} />
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>Sector: <span className="font-medium text-gray-900 dark:text-white">{stock.sector}</span></span>
        <span>Industry: <span className="font-medium text-gray-900 dark:text-white">{stock.industry}</span></span>
        <span>ISIN: <span className="font-mono text-gray-900 dark:text-white">{stock.isin}</span></span>
      </div>

      {stock.holding && (
        <Card title="Your Position">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatQuantity(stock.holding.quantity)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Price</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(stock.holding.avgPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current Value</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(stock.holding.currentValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">P&L</p>
              <p className={`font-medium ${stock.holding.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatSignedCurrency(stock.holding.pl)} ({formatPercent(stock.holding.plPercent)})
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Trades" subtitle={`${stock.trades.length} transactions`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Date', 'Type', 'Qty', 'Price'].map((h) => (
                  <th key={h} className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${h !== 'Date' && h !== 'Type' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {stock.trades.map((t, i) => (
                <tr key={i} className="text-sm">
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatDate(t.date)}</td>
                  <td className="px-3 py-3">
                    <Badge variant={t.type === 'BUY' ? 'active' : 'loss'} size="sm">{t.type}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right text-gray-900 dark:text-white">{formatQuantity(t.qty)}</td>
                  <td className="px-3 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(t.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Notes">
        <div className="space-y-3">
          {stock.notes.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">No notes yet.</p>
          )}
          {stock.notes.map((n) => (
            <div key={n.id} className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
              <p className="text-sm text-gray-700 dark:text-gray-300">{n.content}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatDate(n.date)}</p>
            </div>
          ))}
          <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            <StickyNote className="h-4 w-4" /> Add Note
          </button>
        </div>
      </Card>
    </div>
  );
}
