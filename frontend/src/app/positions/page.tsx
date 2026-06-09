'use client';

import { useState } from 'react';
import { Plus, Trash2, Target, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatSignedCurrency, formatPercent, formatQuantity } from '@/lib/utils/formatters';

interface Position {
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  totalInvested: number;
  ltp: number;
  currentValue: number;
  pl: number;
  plPercent: number;
  targets: { id: number; price: number; qty: number | null }[];
  stopLosses: { id: number; price: number; qty: number | null }[];
}

const MOCK_POSITIONS: Position[] = [
  { id: 1, symbol: 'RELIANCE', name: 'Reliance Industries Ltd', quantity: 15, avgPrice: 2450.50, totalInvested: 36757.50, ltp: 2680.00, currentValue: 40200.00, pl: 3442.50, plPercent: 9.36, targets: [{ id: 1, price: 2800, qty: 15 }], stopLosses: [{ id: 1, price: 2300, qty: null }] },
  { id: 2, symbol: 'TCS', name: 'Tata Consultancy Services Ltd', quantity: 10, avgPrice: 3500.65, totalInvested: 35006.50, ltp: 3800.00, currentValue: 38000.00, pl: 2993.50, plPercent: 8.55, targets: [{ id: 2, price: 4000, qty: null }], stopLosses: [] },
  { id: 3, symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', quantity: 20, avgPrice: 1620.00, totalInvested: 32400.00, ltp: 1750.50, currentValue: 35010.00, pl: 2610.00, plPercent: 8.06, targets: [], stopLosses: [{ id: 2, price: 1500, qty: null }] },
  { id: 4, symbol: 'INFY', name: 'Infosys Ltd', quantity: 25, avgPrice: 1580.00, totalInvested: 39500.00, ltp: 1690.00, currentValue: 42250.00, pl: 2750.00, plPercent: 6.96, targets: [{ id: 3, price: 1800, qty: 25 }], stopLosses: [{ id: 3, price: 1450, qty: null }] },
  { id: 5, symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', quantity: 30, avgPrice: 1120.00, totalInvested: 33600.00, ltp: 1190.00, currentValue: 35700.00, pl: 2100.00, plPercent: 6.25, targets: [], stopLosses: [{ id: 4, price: 1050, qty: null }] },
];

function PositionCard({ position }: { position: Position }) {
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [showAddSL, setShowAddSL] = useState(false);
  const p = position;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.symbol}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{p.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(p.ltp)}</p>
          <p className={`text-sm font-medium ${p.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatSignedCurrency(p.pl)} ({formatPercent(p.plPercent)})
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatQuantity(p.quantity)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Cost</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(p.avgPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Value</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(p.currentValue)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Target className="h-4 w-4 text-emerald-500" /> Targets
            </span>
            <button
              onClick={() => { setShowAddTarget(!showAddTarget); setShowAddSL(false); }}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          {p.targets.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">No targets set</p>
          )}
          {p.targets.map((t) => {
            const gap = ((t.price - p.ltp) / p.ltp) * 100;
            return (
              <div key={t.id} className="mb-1.5 flex items-center justify-between rounded-md bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950">
                <div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{formatCurrency(t.price)}</span>
                  {t.qty && <span className="ml-2 text-xs text-emerald-500">({formatQuantity(t.qty)} shares)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">{gap >= 0 ? '+' : ''}{gap.toFixed(1)}% away</span>
                  <button className="text-emerald-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Shield className="h-4 w-4 text-red-500" /> Stop Loss
            </span>
            <button
              onClick={() => { setShowAddSL(!showAddSL); setShowAddTarget(false); }}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          {p.stopLosses.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">No stop loss set</p>
          )}
          {p.stopLosses.map((sl) => {
            const gap = ((sl.price - p.ltp) / p.ltp) * 100;
            return (
              <div key={sl.id} className="mb-1.5 flex items-center justify-between rounded-md bg-red-50 px-3 py-1.5 dark:bg-red-950">
                <div>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">{formatCurrency(sl.price)}</span>
                  {sl.qty && <span className="ml-2 text-xs text-red-500">({formatQuantity(sl.qty)} shares)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 dark:text-red-400">{gap.toFixed(1)}% away</span>
                  <button className="text-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PositionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Open Positions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage active holdings, stop losses, and targets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {MOCK_POSITIONS.map((pos) => (
          <PositionCard key={pos.id} position={pos} />
        ))}
      </div>
    </div>
  );
}
