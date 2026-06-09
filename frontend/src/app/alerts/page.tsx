'use client';

import { useState } from 'react';
import { Plus, Trash2, BellOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useAlerts, useCreateAlert, useDeleteAlert } from '@/hooks/useAlerts';
import { ApiRequestError } from '@/lib/api';

export default function AlertsPage() {
  const { data: alerts, isLoading, error } = useAlerts();
  const createMutation = useCreateAlert();
  const deleteMutation = useDeleteAlert();

  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [target, setTarget] = useState('');

  const activeAlerts = (alerts ?? []).filter((a) => a.is_active && !a.is_triggered);
  const triggeredAlerts = (alerts ?? []).filter((a) => a.is_triggered);
  const inactiveAlerts = (alerts ?? []).filter((a) => !a.is_active && !a.is_triggered);

  const handleCreate = async () => {
    if (!symbol || !target) return;
    try {
      await createMutation.mutateAsync({ symbol: symbol.toUpperCase(), alert_type: type, target_price: Number(target) });
      setSymbol(''); setTarget('');
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try { await deleteMutation.mutateAsync(id); } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Price Alerts</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create and manage stock price alerts.</p>
      </div>

      <Card title="Create Alert">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Stock Symbol</label>
            <input type="text" placeholder="e.g. RELIANCE" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>
          <div className="w-[120px]">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'ABOVE' | 'BELOW')} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="ABOVE">Price Above</option>
              <option value="BELOW">Price Below</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Target Price (₹)</label>
            <input type="number" placeholder="e.g. 4000" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>
          <button onClick={handleCreate} disabled={createMutation.isPending} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            <Plus className="h-4 w-4" /> Create Alert
          </button>
        </div>
        {createMutation.error && <p className="mt-2 text-sm text-red-600">{(createMutation.error as ApiRequestError).message}</p>}
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Failed to load: {(error as ApiRequestError).message}
        </div>
      )}

      <Card title="Active Alerts" subtitle={`${activeAlerts.length} monitoring`}>
        {isLoading ? (
          <div className="space-y-2 py-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div>
        ) : activeAlerts.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">No active alerts</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Symbol', 'Direction', 'Target', 'LTP', 'Gap', 'Created', ''].map((h) => (
                    <th key={h} className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${h !== 'Symbol' && h !== 'Direction' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {activeAlerts.map((a) => (
                    <tr key={a.id} className="text-sm">
                      <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{a.symbol}</td>
                      <td className="px-3 py-3"><Badge variant={a.alert_type === 'ABOVE' ? 'info' : 'warning'} size="sm">{a.alert_type === 'ABOVE' ? '↑ Above' : '↓ Below'}</Badge></td>
                      <td className="px-3 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(a.target_price)}</td>
                      <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400">-</td>
                      <td className="px-3 py-3 text-right text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-3 py-3 text-right text-xs text-gray-400 dark:text-gray-500">{formatDate(a.created_at)}</td>
                      <td className="px-3 py-3 text-right">
                        <button onClick={() => handleDelete(a.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {triggeredAlerts.length > 0 && (
        <Card title="Triggered" subtitle="Alerts that have been hit">
          <div className="space-y-2">
            {triggeredAlerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <BellOff className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{a.symbol}</span>
                  <Badge variant="neutral" size="sm">{a.alert_type === 'ABOVE' ? '↑ Above' : '↓ Below'} {formatCurrency(a.target_price)}</Badge>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">Triggered {a.triggered_at ? formatDate(a.triggered_at) : ''}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
