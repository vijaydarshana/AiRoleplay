'use client';

/**
 * Supabase session persistence service.
 * Syncs roleplay sessions to/from the `roleplay_sessions` table.
 * Falls back to localStorage when Supabase is unavailable or user is not authenticated.
 */

import { createClient } from '@/lib/supabase/client';
import type { SessionRecord } from '@/types';

function isSchemaError(error: any): boolean {
  if (!error) return false;
  if (error.code && typeof error.code === 'string') {
    const cls = error.code.substring(0, 2);
    if (cls === '42' || cls === '08') return true;
    if (cls === '23') return false;
  }
  if (error.message) {
    const patterns = [
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /function.*does not exist/i,
      /syntax error/i,
      /type.*does not exist/i,
    ];
    return patterns.some((p) => p.test(error.message));
  }
  return false;
}

// ─── Row ↔ SessionRecord conversion ────────────────────────────────────────

function rowToSession(row: any): SessionRecord {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    scenarioTitle: row.scenario_title,
    startedAt: Number(row.started_at),
    duration: row.duration,
    turns: row.turns,
    transcript: row.transcript ?? [],
    score: row.score ?? {},
    protocolItems: row.protocol_items ?? [],
  } as SessionRecord;
}

function sessionToRow(session: SessionRecord) {
  return {
    id: session.id,
    scenario_id: session.scenarioId,
    scenario_title: session.scenarioTitle,
    started_at: session.startedAt,
    duration: session.duration,
    turns: session.turns,
    transcript: session.transcript,
    score: session.score,
    protocol_items: session.protocolItems,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function saveSessionToSupabase(session: SessionRecord): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // not authenticated — skip cloud save

  try {
    const { error } = await supabase
      .from('roleplay_sessions')
      .upsert(sessionToRow(session), { onConflict: 'id' });

    if (error) {
      if (isSchemaError(error)) {
        console.error('Supabase schema error saving session:', error.message);
        throw error;
      } else {
        console.warn('Supabase data error saving session:', error.message);
      }
    }
  } catch (err: any) {
    if (isSchemaError(err)) throw err;
    console.warn('Failed to save session to Supabase:', err?.message);
  }
}

export async function getSessionsFromSupabase(): Promise<SessionRecord[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from('roleplay_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      if (isSchemaError(error)) {
        console.error('Supabase schema error fetching sessions:', error.message);
        throw error;
      } else {
        console.warn('Supabase data error fetching sessions:', error.message);
        return [];
      }
    }

    return (data ?? []).map(rowToSession);
  } catch (err: any) {
    if (isSchemaError(err)) throw err;
    console.warn('Failed to fetch sessions from Supabase:', err?.message);
    return [];
  }
}

export async function getSessionFromSupabase(id: string): Promise<SessionRecord | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('roleplay_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (isSchemaError(error)) {
        console.error('Supabase schema error fetching session:', error.message);
        throw error;
      } else {
        console.warn('Supabase data error fetching session:', error.message);
        return null;
      }
    }

    return data ? rowToSession(data) : null;
  } catch (err: any) {
    if (isSchemaError(err)) throw err;
    console.warn('Failed to fetch session from Supabase:', err?.message);
    return null;
  }
}
