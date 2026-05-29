// ─────────────────────────────────────────────────────────────────
//  Join Requests Supabase service
//  Table: join_requests (dedicated table, separate from app_config)
//
//  Run this once in your Supabase SQL Editor before using:
//
//  CREATE TABLE IF NOT EXISTS join_requests (
//    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
//    name_ar      text        NOT NULL,
//    name_en      text,
//    phone        text        NOT NULL,
//    age          text        NOT NULL,
//    group_id     text,
//    message      text,
//    submitted_at timestamptz DEFAULT now(),
//    status       text        DEFAULT 'pending'
//                             CHECK (status IN ('pending','accepted','rejected'))
//  );
//  ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
//  CREATE POLICY "Public insert" ON join_requests FOR INSERT TO public WITH CHECK (true);
//  CREATE POLICY "Auth select"  ON join_requests FOR SELECT TO authenticated USING (true);
//  CREATE POLICY "Auth update"  ON join_requests FOR UPDATE TO authenticated USING (true);
//  CREATE POLICY "Auth delete"  ON join_requests FOR DELETE TO authenticated USING (true);
//
// ─────────────────────────────────────────────────────────────────

import type { JoinRequest } from '@/contexts/AppContext';
import { getSupabase } from '@/lib/supabaseClient';

const TABLE = 'join_requests';

// ── Database row shape (PostgreSQL snake_case columns) ────────────
type JoinRequestRow = {
  id: string;
  name_ar: string;
  name_en: string | null;
  phone: string;
  age: string;
  group_id: string | null;
  message: string | null;
  submitted_at: string;
  status: 'pending' | 'accepted' | 'rejected';
};

type QueryResult = {
  data: JoinRequestRow[] | null;
  error: { message: string } | null;
};

type MutationResult = {
  error: { message: string } | null;
};

// ── Convert DB row → app interface ───────────────────────────────
function rowToRequest(row: JoinRequestRow): JoinRequest {
  return {
    id: row.id,
    nameAr: row.name_ar,
    nameEn: row.name_en ?? '',
    phone: row.phone,
    age: row.age,
    groupId: row.group_id ?? '',
    message: row.message ?? '',
    date: row.submitted_at,
    status: row.status,
  };
}

// ─────────────────────────────────────────────────────────────────
//  PUBLIC — no auth required (INSERT policy is public)
// ─────────────────────────────────────────────────────────────────

/** Submit a join request. Returns true on success, false on any error. */
export async function submitJoinRequest(req: JoinRequest): Promise<boolean> {
  try {
    const sb = await getSupabase();
    if (!sb) return false;

    const row = {
      id: req.id,
      name_ar: req.nameAr,
      name_en: req.nameEn || null,
      phone: req.phone,
      age: req.age,
      group_id: req.groupId || null,
      message: req.message || null,
      submitted_at: req.date,
      status: 'pending' as const,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await (sb.from(TABLE) as any).insert(row)) as MutationResult;
    if (result.error) {
      console.warn('submitJoinRequest error:', result.error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('submitJoinRequest exception:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────
//  ADMIN — require authenticated session (RLS: Auth select/update/delete)
// ─────────────────────────────────────────────────────────────────

/** Load all join requests, sorted newest first. Throws on RLS/network errors. */
export async function loadJoinRequests(): Promise<JoinRequest[]> {
  const sb = await getSupabase();
  if (!sb) throw new Error('Supabase not configured');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (await (sb.from(TABLE) as any)
    .select('*')
    .order('submitted_at', { ascending: false })) as QueryResult;

  if (result.error) {
    throw new Error(result.error.message);
  }
  return (result.data ?? []).map(rowToRequest);
}

/** Update the status of a single request. Returns true on success. */
export async function updateJoinRequestStatus(
  id: string,
  status: JoinRequest['status'],
): Promise<boolean> {
  try {
    const sb = await getSupabase();
    if (!sb) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await (sb.from(TABLE) as any)
      .update({ status })
      .eq('id', id)) as MutationResult;

    if (result.error) {
      console.warn('updateJoinRequestStatus error:', result.error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('updateJoinRequestStatus exception:', err);
    return false;
  }
}

/** Delete a single request. Returns true on success. */
export async function deleteJoinRequest(id: string): Promise<boolean> {
  try {
    const sb = await getSupabase();
    if (!sb) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await (sb.from(TABLE) as any)
      .delete()
      .eq('id', id)) as MutationResult;

    if (result.error) {
      console.warn('deleteJoinRequest error:', result.error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('deleteJoinRequest exception:', err);
    return false;
  }
}
