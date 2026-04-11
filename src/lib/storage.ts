/**
 * @deprecated Use @/frontend/services/storage.service instead.
 * This file re-exports from the frontend service layer for backward compatibility.
 */

export {
  getSessions,
  saveSession,
  getSession,
  clearSessions,
  getPendingSession,
  setPendingSession,
  clearPendingSession,
  getSessionsWithCloud,
  getSessionWithCloud,
} from '@/frontend/services/storage.service';