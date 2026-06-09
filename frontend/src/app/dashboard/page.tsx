'use client';

import { Wallet, TrendingUp, TrendingDown, BarChart3, ArrowRight, Bell } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import {
  formatCurrency, formatSignedCurrency, formatPercent, formatDate, formatQuantity
} from '@/lib/utils/formatters';

// ── Mock Data ──────────────────────────────────────────────

const MOCK_PORTFOLIO = {
  availableCash: 64993.47,
  totalInvested: 103663.50,
  currentValue: 122960.00,
  unrealizedPL: 19296.50,
  unrealizedPLPercent: 18.61,
  realizedPL: 2473.00,
  realizedPLPercent: 2.39
};

const MOCK_HOLDINGS = [
  { id: 1, symbol: 'RELIANCE', name: 'Reliance Industries Ltd', quantity: 15, avgPrice: 2450.50, ltp: 2680.00, investVal: 36757.50, currVal: 40200.00, pl: 3442.50, plPercent: 9.36 },
  { id: 2, symbol: 'TCS', name: 'Tata Consultancy Services', quantity: 10, avgPrice: 3500.65, ltp: 3800.00, investVal: 35006.50, currVal: 38000.00, pl: 2993.50, plPercent: 8.55 },
  { id: 3, symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', quantity: 20, avgPrice: 1620.00, ltp: 1750.50, investVal: 32400.00, currVal: 35010.00, pl: 2610.00, plPercent: 8.06 },
  { id: 4, symbol: 'INFY', name: 'Infosys Ltd', quantity: 25, avgPrice: 1580.00, ltp: 1690.00, investVal: 39500.00, currVal: 42250.00, pl: 2750.00, plPercent: 6.96 },
  { id: 5, symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', quantity: 30, avgPrice: 1120.00, ltp: 1190.00, investVal: 33600.00, currVal: 35700.00, pl: 2100.00, plPercent: 6.25 }
];

const MOCK_TRADES = [
  { id: 1, date: '2026-06-08', symbol: 'TCS', type: 'BUY' as const, qty: 10, price: 3500.00 },
  { id: 2, date: '2026-06-08', symbol: 'RELIANCE', type: 'BUY' as const, qty: 15, price: 2450.50 },
  { id: 3, date: '2026-06-07', symbol: 'HDFCBANK', type: 'BUY' as const, qty: 20, price: 1620.00 },
  { id: 4, date: '2026-06-07', symbol: 'INFY', type: 'SELL' as const, qty: 10, price: 1690.00 },
  { id: 5, date: '2026-06-06', symbol: 'ICICIBANK', type: 'BUY' as const, qty: 30, price: 1120.00 }
];

const MOCK_ALERTS = [
  { id: 1, symbol: 'TCS', type: 'ABOVE' as const, target: 4000.00, ltp: 3800.00 },
  { id: 2, symbol: 'RELIANCE', type: 'ABOVE' as const, target: 2800.00, ltp: 2680.00 },
  { id: 3, symbol: 'INFY', type: 'BELOW' as const, target: 1550.00, ltp: 1690.00 }
];

// ── Column Definitions ─────────────────────────────────────

type HoldingRow = (typeof MOCK_HOLDINGS)[number];
type TradeRow = (typeof MOCK_TRADES)[number];
type AlertRow = (typeof MOCK_ALERTS)[number];

const holdingColumns = [
  { key: 'symbol', header: 'Symbol', render: (h: HoldingRow) => (
    <div>
      <span className="font-medium text-gray-900 dark:text-white">{h.symbol}</span>
      <span className="ml-2 text-xs text-gray-400">{h.quantity} shares</span>
    </div>
  )},
  { key: 'ltp', header: 'LTP', align: 'right' as const, render: (h: HoldingRow) => (
    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(h.ltp)}</span>
  )},
  { key: 'investVal', header: 'Invested', align: 'right' as const, render: (h: HoldingRow) => (
    <span className="text-gray-600 dark:text-gray-400">{formatCurrency(h.investVal)}</span>
  )},
  { key: 'currVal', header: 'Current', align: 'right' as const, render: (h: HoldingRow) => (
    <span className="text-gray-900 dark:text-white">{formatCurrency(h.currVal)}</span>
  )},
  { key: 'pl', header: 'P&L', align: 'right' as const, render: (h: HoldingRow) => (
    <span className={h.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
      {formatSignedCurrency(h.pl)}
      <span className="ml-1 text-xs">({h.plPercent >= 0 ? '+' : ''}{h.plPercent.toFixed(2)}%)</span>
    </span>
  )}
];

const tradeColumns = [
  { key: 'date', header: 'Date', render: (t: TradeRow) => (
    <span className="text-gray-600 dark:text-gray-400">{formatDate(t.date)}</span>
  )},
  { key: 'symbol', header: 'Symbol', render: (t: TradeRow) => (
    <span className="font-medium text-gray-900 dark:text-white">{t.symbol}</span>
  )},
  { key: 'type', header: 'Type', align: 'center' as const, render: (t: TradeRow) => (
    <Badge variant={t.type === 'BUY' ? 'profit' : 'loss'} size="sm">
      {t.type}
    </Badge>
  )},
  { key: 'qty', header: 'Qty', align: 'right' as const, render: (t: TradeRow) => (
    <span className="text-gray-900 dark:text-white">{formatQuantity(t.qty)}</span>
  )},
  { key: 'price', header: 'Price', align: 'right' as const, render: (t: TradeRow) => (
    <span className="text-gray-900 dark:text-white">{formatCurrency(t.price)}</span>
  )}
];

const alertColumns = [
  { key: 'symbol', header: 'Symbol', render: (a: AlertRow) => (
    <span className="font-medium text-gray-900 dark:text-white">{a.symbol}</span>
  )},
  { key: 'type', header: 'Direction', align: 'center' as const, render: (a: AlertRow) => (
    <Badge variant={a.type === 'ABOVE' ? 'info' : 'warning'} size="sm">
      {a.type === 'ABOVE' ? '↑ Above' : '↓ Below'}
    </Badge>
  )},
  { key: 'target', header: 'Target', align: 'right' as const, render: (a: AlertRow) => (
    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(a.target)}</span>
  )},
  { key: 'ltp', header: 'LTP', align: 'right' as const, render: (a: AlertRow) => (
    <span className="text-gray-600 dark:text-gray-400">{formatCurrency(a.ltp)}</span>
  )},
  { key: 'gap', header: 'Gap', align: 'right' as const, render: (a: AlertRow) => {
    const gap = a.type === 'ABOVE'
      ? ((a.target - a.ltp) / a.ltp) * 100
      : ((a.ltp - a.target) / a.target) * 100;
    return (
      <span className="text-gray-500 dark:text-gray-400">{gap.toFixed(1)}%</span>
    );
  }}
];

// ── Page ───────────────────────────────────────────────────

export default function DashboardPage() {
  const p = MOCK_PORTFOLIO;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Portfolio overview and market summary
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available Cash"
          value={formatCurrency(p.availableCash)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Total Invested"
          value={formatCurrency(p.totalInvested)}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          label="Unrealized P&L"
          value={formatSignedCurrency(p.unrealizedPL)}
          change={p.unrealizedPLPercent}
          variant={p.unrealizedPL >= 0 ? 'profit' : 'loss'}
          icon={p.unrealizedPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          label="Realized P&L"
          value={formatSignedCurrency(p.realizedPL)}
          change={p.realizedPLPercent}
          variant={p.realizedPL >= 0 ? 'profit' : 'loss'}
          icon={p.realizedPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
      </div>

      {/* Holdings + Trades */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Top Holdings" subtitle="Your largest positions">
          <DataTable
            columns={holdingColumns}
            data={MOCK_HOLDINGS}
            keyExtractor={(h) => h.id}
          />
        </Card>

        <Card title="Recent Trades" subtitle="Last 5 transactions">
          <DataTable
            columns={tradeColumns}
            data={MOCK_TRADES}
            keyExtractor={(t) => t.id}
          />
        </Card>
      </div>

      {/* Active Alerts */}
      <Card
        title="Active Alerts"
        subtitle="Price alerts currently being monitored"
      >
        <DataTable
          columns={alertColumns}
          data={MOCK_ALERTS}
          keyExtractor={(a) => a.id}
        />
      </Card>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <Bell className="h-5 w-5 text-gray-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Price alerts are checked every minute. You have <span className="font-medium text-gray-900 dark:text-white">{MOCK_ALERTS.length} active</span> alerts.
        </p>
      </div>
    </div>
  );
}
