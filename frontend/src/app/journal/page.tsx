'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';

type Mood = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

interface Entry {
  id: number;
  date: string;
  symbol: string;
  mood: Mood;
  title: string;
  content: string;
  tradeType?: 'BUY' | 'SELL';
  tradeQty?: number;
  tradePrice?: number;
}

const MOCK_ENTRIES: Entry[] = [
  { id: 1, date: '2026-06-08', symbol: 'RELIANCE', mood: 'BULLISH', title: 'Strong breakout above resistance', content: 'RELIANCE broke above ₹2,600 with strong volume. The stock has been consolidating for 2 weeks and the breakout looks convincing. Holding for ₹2,800 target.', tradeType: 'BUY', tradeQty: 15, tradePrice: 2450.50 },
  { id: 2, date: '2026-06-07', symbol: 'INFY', mood: 'NEUTRAL', title: 'Partial profit booking', content: 'Booked 10 shares of INFY at ₹1,690. The stock had a good run from ₹1,580. Keeping remaining 25 shares for ₹1,800 target.', tradeType: 'SELL', tradeQty: 10, tradePrice: 1690.00 },
  { id: 3, date: '2026-06-07', symbol: 'HDFCBANK', mood: 'BULLISH', title: 'Good support at ₹1,600', content: 'HDFCBANK found strong support at ₹1,600 level. Added 20 shares. Banking sector outlook positive. Stop loss at ₹1,500.', tradeType: 'BUY', tradeQty: 20, tradePrice: 1620.00 },
  { id: 4, date: '2026-06-06', symbol: 'ICICIBANK', mood: 'BULLISH', title: 'Value buying on dip', content: 'ICICIBANK corrected 5% from highs. Added 30 shares at ₹1,120. Strong fundamentals, good dividend yield. Target ₹1,300.', tradeType: 'BUY', tradeQty: 30, tradePrice: 1120.00 },
  { id: 5, date: '2026-06-05', symbol: 'TCS', mood: 'BULLISH', title: 'IT sector momentum', content: 'TCS showing strength along with IT sector. Results expected next month. Added 10 shares at ₹3,500.', tradeType: 'BUY', tradeQty: 10, tradePrice: 3500.65 },
];

const moodBadgeVariant: Record<Mood, 'profit' | 'loss' | 'neutral'> = {
  BULLISH: 'profit',
  BEARISH: 'loss',
  NEUTRAL: 'neutral',
};

const MOODS: Mood[] = ['BULLISH', 'BEARISH', 'NEUTRAL'];

export default function JournalPage() {
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState<Mood | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = MOCK_ENTRIES.filter((e) => {
    const matchesSearch = e.symbol.toLowerCase().includes(search.toLowerCase()) || e.title.toLowerCase().includes(search.toLowerCase());
    const matchesMood = moodFilter === 'ALL' || e.mood === moodFilter;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trade Journal</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Record and review your trade rationale and reflections.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by symbol or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', ...MOODS] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMoodFilter(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                moodFilter === m
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {m === 'ALL' ? 'All' : m.charAt(0) + m.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
          >
            <button
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <Badge variant={moodBadgeVariant[entry.mood]} size="sm">
                  {entry.mood}
                </Badge>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{entry.title}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {entry.symbol} &middot; {formatDate(entry.date)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {entry.tradeType && (
                  <Badge variant={entry.tradeType === 'BUY' ? 'profit' : 'loss'} size="sm">
                    {entry.tradeType}
                  </Badge>
                )}
                <Plus className={`h-4 w-4 text-gray-400 transition-transform ${expandedId === entry.id ? 'rotate-45' : ''}`} />
              </div>
            </button>
            {expandedId === entry.id && (
              <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{entry.content}</p>
                {entry.tradeType && entry.tradeQty && entry.tradePrice && (
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Trade: {entry.tradeType} {entry.tradeQty} @ {formatCurrency(entry.tradePrice)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
