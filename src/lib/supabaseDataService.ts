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

// ── Local types that describe the app_config table shape ──────────
// getSupabase() returns a client with no Database generic, so
// TypeScript cannot infer row types. We cast query results through
// `unknown` to these explicit types to satisfy the compiler.

type ConfigRow = {
  id: number;
  data: Partial<AppData>;
  updated_at: string;
};

type SelectResult = {
  data: { data: Partial<AppData> } | null;
  error: { code: string; message: string } | null;
};

type WriteResult = {
  error: { message: string } | null;
};

/** Load AppData from Supabase DB. Returns null if unavailable or no row yet. */
export async function loadFromSupabaseDB(): Promise<Partial<AppData> | null> {
  try {
    const sb = await getSupabase();
    if (!sb) return null;

    // Cast through unknown: Supabase has no DB generic here so data would
    // be inferred as `never` without the explicit type annotation.
    const result = (await sb
      .from(TABLE)
      .select('data')
      .eq('id', ROW_ID)
      .single()) as unknown as SelectResult;

    if (result.error) {
      // PGRST116 = no rows found — not an error for us
      if (result.error.code === 'PGRST116') return null;
      console.warn('loadFromSupabaseDB error:', result.error.message);
      return null;
    }

    return result.data?.data ?? null;
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

    // Build the row as a typed local object, then cast through unknown so
    // the upsert() call does not reject `id` as an unknown property.
    const row: ConfigRow = {
      id: ROW_ID,
      data: JSON.parse(JSON.stringify(appData)) as Partial<AppData>,
      updated_at: new Date().toISOString(),
    };

    // Cast from(TABLE) to any so TypeScript does not restrict the upsert
    // payload shape — the Supabase client has no Database generic here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await (sb.from(TABLE) as any).upsert(row, { onConflict: 'id' })) as WriteResult;

    if (result.error) {
      console.warn('saveToSupabaseDB error:', result.error.message);
    }
  } catch (err) {
    console.warn('saveToSupabaseDB exception:', err);
  }
}
