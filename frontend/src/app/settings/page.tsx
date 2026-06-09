'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Sun, Moon, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import { usePortfolio, useSetCapital } from '@/hooks/usePortfolio';
import { ApiRequestError } from '@/lib/api';

const DEFAULT_CHARGES = {
  brokerage: 20, brokerageType: 'fixed' as 'fixed' | 'percent',
  stt: 0.025, exchangeCharges: 0.00345, gst: 18,
  sebiCharges: 10, stampDuty: 0.003,
};

export default function SettingsPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const setCapitalMutation = useSetCapital();
  const [initialCapital, setInitialCapital] = useState('200000');
  const [darkMode, setDarkMode] = useState(false);
  const [charges, setCharges] = useState(DEFAULT_CHARGES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    setDarkMode(stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme:dark)').matches));
  }, []);

  useEffect(() => {
    if (portfolio) setInitialCapital(String(portfolio.initial_capital));
  }, [portfolio]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleSaveCapital = async () => {
    try {
      await setCapitalMutation.mutateAsync(Number(initialCapital));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const resetCharges = () => setCharges(DEFAULT_CHARGES);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure initial capital and application preferences.</p>
      </div>

      <Card title="General">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Capital</label>
            <div className="flex items-center gap-2">
              <span className="text-lg text-gray-500 dark:text-gray-400">₹</span>
              <input type="number" value={initialCapital} onChange={(e) => setInitialCapital(e.target.value)} className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              <button onClick={handleSaveCapital} disabled={setCapitalMutation.isPending} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save'}
              </button>
            </div>
            {portfolio && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Current available cash: {formatCurrency(portfolio.available_cash)}</p>}
            {setCapitalMutation.error && <p className="mt-1 text-xs text-red-500">{(setCapitalMutation.error as ApiRequestError).message}</p>}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
            </div>
            <button onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}>
                {darkMode ? <Moon className="h-3 w-3 text-blue-600" /> : <Sun className="h-3 w-3 text-amber-500" />}
              </span>
            </button>
          </div>
        </div>
      </Card>

      <Card title="Charges Configuration">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Brokerage</label>
              <div className="flex gap-2">
                <input type="number" value={charges.brokerage} onChange={(e) => setCharges({ ...charges, brokerage: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                <select value={charges.brokerageType} onChange={(e) => setCharges({ ...charges, brokerageType: e.target.value as 'fixed' | 'percent' })} className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                  <option value="fixed">Fixed</option>
                  <option value="percent">%</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">STT (%)</label>
              <input type="number" step="0.001" value={charges.stt} onChange={(e) => setCharges({ ...charges, stt: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Exchange Charges (%)</label>
              <input type="number" step="0.00001" value={charges.exchangeCharges} onChange={(e) => setCharges({ ...charges, exchangeCharges: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">GST (%)</label>
              <input type="number" value={charges.gst} onChange={(e) => setCharges({ ...charges, gst: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">SEBI Charges (₹/cr)</label>
              <input type="number" step="0.01" value={charges.sebiCharges} onChange={(e) => setCharges({ ...charges, sebiCharges: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Stamp Duty (%)</label>
              <input type="number" step="0.001" value={charges.stampDuty} onChange={(e) => setCharges({ ...charges, stampDuty: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Save className="h-4 w-4" /> Save Charges</button>
            <button onClick={resetCharges} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"><RotateCcw className="h-4 w-4" /> Reset to Default</button>
          </div>
        </div>
      </Card>

      <Card title="Portfolio">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Reset your portfolio to start fresh. This will clear all trades, holdings, and P&L data.</p>
          <button className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950"><AlertTriangle className="h-4 w-4" /> Reset Portfolio</button>
        </div>
      </Card>
    </div>
  );
}
