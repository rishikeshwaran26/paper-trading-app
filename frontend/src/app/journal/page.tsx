'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { useJournalEntries } from '@/hooks/useJournal';
import { ApiRequestError } from '@/lib/api';

type Mood = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
const MOODS: Mood[] = ['BULLISH', 'BEARISH', 'NEUTRAL'];

const moodBadgeVariant: Record<Mood, 'profit' | 'loss' | 'neutral'> = {
  BULLISH: 'profit', BEARISH: 'loss', NEUTRAL: 'neutral',
};

export default function JournalPage() {
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState<Mood | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filters: Record<string, string | undefined> = {};
  if (moodFilter !== 'ALL') filters.mood = moodFilter;

  const { data: entries, isLoading, error } = useJournalEntries(filters);

  const displayEntries = (entries ?? []).filter((e) =>
    e.symbol?.toLowerCase().includes(search.toLowerCase()) || e.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trade Journal</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Record and review your trade rationale and reflections.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by symbol or title..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500" />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', ...MOODS] as const).map((m) => (
            <button key={m} onClick={() => setMoodFilter(m)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${moodFilter === m ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
              {m === 'ALL' ? 'All' : m.charAt(0) + m.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Failed to load: {(error as ApiRequestError).message}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : displayEntries.length === 0 ? (
        <Card><p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No journal entries yet.</p></Card>
      ) : (
        <div className="space-y-3">
          {displayEntries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
              <button onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-3">
                  <Badge variant={moodBadgeVariant[entry.mood as Mood] ?? 'neutral'} size="sm">{entry.mood}</Badge>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{entry.title}</span>
                    {entry.symbol && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{entry.symbol} &middot; {formatDate(entry.entry_date)}</span>}
                  </div>
                </div>
                <Plus className={`h-4 w-4 text-gray-400 transition-transform ${expandedId === entry.id ? 'rotate-45' : ''}`} />
              </button>
              {expandedId === entry.id && entry.content && (
                <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{entry.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
