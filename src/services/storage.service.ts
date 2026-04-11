/**
 * @deprecated Use @/frontend/services/storage.service instead.
 * Re-exports from the frontend service layer for backward compatibility.
 */
export {
  getSessions,
  saveSession,
  getSession,
  clearSessions,
  getPendingSession,
  setPendingSession,
  clearPendingSession,
} from '@/frontend/services/storage.service';
