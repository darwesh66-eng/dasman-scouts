// ─────────────────────────────────────────────────────────────────
//  Supabase Database service for AppData persistence
//  Table: app_config  (single-row pattern, id = 1)
//  See SQL setup instructions below ↓
// ─────────────────────────────────────────────────────────────────
//
//  Run this once in your Supabase SQL Editor:
//
//  CREATE TABLE IF NOT EXISTS app_config (
//    id         integer     PRIMARY KEY DEFAULT 1,
//    data       jsonb       NOT NULL,
//    updated_at timestamptz DEFAULT now()
//  );
//  ALTER TABLE app_config ADD CONSTRAINT single_row CHECK (id = 1);
//  ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
//  CREATE POLICY "Public read"   ON app_config FOR SELECT TO public USING (true);
//  CREATE POLICY "Public insert" ON app_config FOR INSERT TO public WITH CHECK (true);
//  CREATE POLICY "Public update" ON app_config FOR UPDATE TO public USING (true);
//
// ─────────────────────────────────────────────────────────────────

import type { AppData } from '@/contexts/AppContext';
import { getSupabase } from '@/lib/supabaseClient';

const TABLE = 'app_config';
const ROW_ID = 1;

/** Load AppData from Supabase DB. Returns null if unavailable or no row yet. */
export async function loadFromSupabaseDB(): Promise<Partial<AppData> | null> {
  try {
    const sb = await getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from(TABLE)
      .select('data')
      .eq('id', ROW_ID)
      .single();

    if (error) {
      // PGRST116 = no rows found — not an error for us
      if (error.code === 'PGRST116') return null;
      console.warn('loadFromSupabaseDB error:', error.message);
      return null;
    }

    return (data?.data as Partial<AppData>) ?? null;
  } catch (err) {
    console.warn('loadFromSupabaseDB exception:', err);
    return null;
  }
}

/** Save the full AppData to Supabase DB (upsert on id = 1). */
export async function saveToSupabaseDB(appData: AppData): Promise<void> {
  try {
    const sb = await getSupabase();
    if (!sb) return;

    const { error } = await sb.from(TABLE).upsert(
      {
        id: ROW_ID,
        data: JSON.parse(JSON.stringify(appData)), // strip undefined values
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

    if (error) {
      console.warn('saveToSupabaseDB error:', error.message);
    }
  } catch (err) {
    console.warn('saveToSupabaseDB exception:', err);
  }
}
