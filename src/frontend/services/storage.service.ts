/**
 * FRONTEND SERVICE: Storage
 * Handles all client-side persistence (localStorage / sessionStorage).
 * Also syncs to Supabase when a user is authenticated.
 * Used only by frontend view components and hooks.
 */

import type { SessionRecord } from '@/types';
import {
  STORAGE_KEY,
  PENDING_SESSION_KEY,
  MAX_SESSIONS,
} from '@/backend/models/session.model';
import {
  saveSessionToSupabase,
  getSessionsFromSupabase,
  getSessionFromSupabase,
} from '@/lib/supabase/sessionService';

// ─── Session History (localStorage + Supabase) ──────────────────────────────

export function getSessions(): SessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export async function getSessionsWithCloud(): Promise<SessionRecord[]> {
  // Try Supabase first; fall back to localStorage
  try {
    const cloud = await getSessionsFromSupabase();
    if (cloud.length > 0) {
      // Merge cloud sessions into localStorage for offline access
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud.slice(0, MAX_SESSIONS)));
      } catch {
        // storage full
      }
      return cloud;
    }
  } catch {
    // Supabase unavailable
  }
  return getSessions();
}

export function saveSession(session: SessionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSessions();
    const updated = [session, ...existing.filter((s) => s.id !== session.id)].slice(0, MAX_SESSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage full or unavailable
  }
  // Fire-and-forget Supabase sync
  saveSessionToSupabase(session).catch(() => {});
}

export function getSession(id: string): SessionRecord | null {
  return getSessions().find((s) => s.id === id) ?? null;
}

export async function getSessionWithCloud(id: string): Promise<SessionRecord | null> {
  // Check localStorage first (fast path)
  const local = getSession(id);
  if (local) return local;
  // Fall back to Supabase
  try {
    return await getSessionFromSupabase(id);
  } catch {
    return null;
  }
}

export function clearSessions(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Pending Session (sessionStorage) ──────────────────────────────────────

export function getPendingSession(): Partial<SessionRecord> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setPendingSession(data: Partial<SessionRecord>): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_SESSION_KEY, JSON.stringify(data));
}

export function clearPendingSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_SESSION_KEY);
}
