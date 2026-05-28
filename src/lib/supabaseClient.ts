// ============================================================
//  🔑  SUPABASE CREDENTIALS
//  Get them from: supabase.com → Project → Settings → API
// ============================================================
export const SUPABASE_URL = 'https://mepqecczssrarczveolo.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_Cd2oZIqROd-ccS4w5fbdsg_eH4w2VCh';
// ============================================================
export const BUCKET = 'uploads';

export function isSupabaseConfigured(): boolean {
  return !SUPABASE_URL.startsWith('REPLACE');
}

let _client: unknown = null;

export async function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (_client) return _client as ReturnType<typeof import('@supabase/supabase-js').createClient>;

  const { createClient } = await import('@supabase/supabase-js');
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client as ReturnType<typeof createClient>;
}
