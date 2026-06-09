'use client';

import { useState } from 'react';
import { Plus, Trash2, Bell, BellOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface Alert {
  id: number;
  symbol: string;
  type: 'ABOVE' | 'BELOW';
  targetPrice: number;
  ltp: number;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

const MOCK_ALERTS: Alert[] = [
  { id: 1, symbol: 'TCS', type: 'ABOVE', targetPrice: 4000, ltp: 3800, isActive: true, isTriggered: false, triggeredAt: null, createdAt: '2026-06-08' },
  { id: 2, symbol: 'RELIANCE', type: 'ABOVE', targetPrice: 2800, ltp: 2680, isActive: true, isTriggered: false, triggeredAt: null, createdAt: '2026-06-07' },
  { id: 3, symbol: 'INFY', type: 'BELOW', targetPrice: 1550, ltp: 1690, isActive: true, isTriggered: false, triggeredAt: null, createdAt: '2026-06-07' },
  { id: 4, symbol: 'HDFCBANK', type: 'ABOVE', targetPrice: 1800, ltp: 1750, isActive: false, isTriggered: false, triggeredAt: null, createdAt: '2026-06-06' },
  { id: 5, symbol: 'SBIN', type: 'BELOW', targetPrice: 800, ltp: 845, isActive: true, isTriggered: true, triggeredAt: '2026-06-05', createdAt: '2026-06-01' },
];

export default function AlertsPage() {
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [target, setTarget] = useState('');

  const activeAlerts = MOCK_ALERTS.filter((a) => a.isActive && !a.isTriggered);
  const triggeredAlerts = MOCK_ALERTS.filter((a) => a.isTriggered);
  const inactiveAlerts = MOCK_ALERTS.filter((a) => !a.isActive && !a.isTriggered);

  const handleCreate = () => {
    if (!symbol || !target) return;
    // Mock: would create alert
    setSymbol('');
    setTarget('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Price Alerts</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create and manage stock price alerts.
        </p>
      </div>

      <Card title="Create Alert">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Stock Symbol</label>
            <input
              type="text"
              placeholder="e.g. RELIANCE"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <div className="w-[120px]">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'ABOVE' | 'BELOW')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="ABOVE">Price Above</option>
              <option value="BELOW">Price Below</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Target Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 4000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Create Alert
          </button>
        </div>
      </Card>

      <Card title="Active Alerts" subtitle={`${activeAlerts.length} monitoring`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Symbol', 'Direction', 'Target', 'LTP', 'Gap', 'Created', ''].map((h) => (
                  <th key={h} className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${h !== 'Symbol' && h !== 'Direction' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {activeAlerts.map((a) => {
                const gap = a.type === 'ABOVE'
                  ? ((a.targetPrice - a.ltp) / a.ltp) * 100
                  : ((a.ltp - a.targetPrice) / a.targetPrice) * 100;
                return (
                  <tr key={a.id} className="text-sm">
                    <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{a.symbol}</td>
                    <td className="px-3 py-3">
                      <Badge variant={a.type === 'ABOVE' ? 'info' : 'warning'} size="sm">
                        {a.type === 'ABOVE' ? '↑ Above' : '↓ Below'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(a.targetPrice)}</td>
                    <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(a.ltp)}</td>
                    <td className="px-3 py-3 text-right text-gray-500 dark:text-gray-400">{gap.toFixed(1)}%</td>
                    <td className="px-3 py-3 text-right text-xs text-gray-400 dark:text-gray-500">{formatDate(a.createdAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {activeAlerts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No active alerts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {triggeredAlerts.length > 0 && (
        <Card title="Triggered" subtitle="Alerts that have been hit">
          <div className="space-y-2">
            {triggeredAlerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <BellOff className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{a.symbol}</span>
                  <Badge variant="neutral" size="sm">{a.type === 'ABOVE' ? '↑ Above' : '↓ Below'} {formatCurrency(a.targetPrice)}</Badge>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Triggered {a.triggeredAt ? formatDate(a.triggeredAt) : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
