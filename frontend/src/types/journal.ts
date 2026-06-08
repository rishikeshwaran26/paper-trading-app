export interface JournalEntry { id: number; trade_id: number | null; stock_id: number | null; symbol: string | null; entry_date: string; title: string; content: string | null; mood: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | null; tags: string | null; created_at: string; updated_at: string }
export interface JournalEntryDetail extends JournalEntry { trade_type?: string; trade_quantity?: number; trade_price?: number }
export interface CreateJournalEntryRequest { trade_id?: number; stock_id?: number; entry_date: string; title: string; content?: string; mood?: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; tags?: string }
export type JournalMood = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
