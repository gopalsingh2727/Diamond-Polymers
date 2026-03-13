/**
 * cacheHelpers.ts
 *
 * Single import point for all cache utilities used by components.
 *
 * readOrdersFromMemory  — SYNC  — reads localStorage only (safe in render/polling)
 * readOrdersFromCache   — ASYNC — memory → disk via IPC (use before download)
 * readCacheMeta         — SYNC  — lightweight meta check (use in DateRangeModal)
 * getSavedOrdersMeta    — re-exported from actions (sync localStorage meta)
 * buildOrdersKey        — key builder shared with actions
 */

export {
  readOrdersFromCache,    // async — localStorage → IPC disk
  getSavedOrdersMeta,     // sync  — localStorage meta
  buildOrdersKey,
} from '../../../../redux/dashbroadData/dashboardreportdataactions';

// ─────────────────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 min — must match actions file

function cacheKey(fromDate: string, toDate: string) {
  return `ordersExport_${fromDate || 'all'}_${toDate || 'all'}`;
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * readOrdersFromMemory  (SYNC)
 *
 * Reads orders directly from localStorage.
 * Safe to call in render, useEffect polling, and count badges.
 * Returns [] if nothing found, data is expired, or parse fails.
 */
export function readOrdersFromMemory(fromDate: string, toDate: string): any[] {
  try {
    const raw = localStorage.getItem(cacheKey(fromDate, toDate));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.orders)) return [];
    const savedAt = parsed?.savedAt ?? null;
    if (savedAt && Date.now() - savedAt > CACHE_TTL_MS) return [];
    return parsed.orders;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * readCacheMeta  (SYNC)
 *
 * Lightweight check — no orders array loaded.
 * Use in DateRangeModal to show "⚡ Cached data available (Xmin ago)".
 *
 * Checks _meta key first (written by persistToCache), then falls back
 * to reading savedAt from the full blob.
 *
 * Returns { ageMinutes } when valid cache exists, null otherwise.
 */
export function readCacheMeta(
  fromDate: string,
  toDate: string,
): { ageMinutes: number } | null {
  try {
    // Primary: _meta key (lightweight, no orders array)
    const metaRaw = localStorage.getItem(`${cacheKey(fromDate, toDate)}_meta`);
    if (metaRaw) {
      const p = JSON.parse(metaRaw);
      if (p?.savedAt && p?.total) {
        const ageMs = Date.now() - p.savedAt;
        if (ageMs <= CACHE_TTL_MS) return { ageMinutes: Math.round(ageMs / 60000) };
      }
    }

    // Fallback: read savedAt from full blob (handles older format without _meta)
    const blobRaw = localStorage.getItem(cacheKey(fromDate, toDate));
    if (!blobRaw) return null;
    const p = JSON.parse(blobRaw);
    if (!p?.savedAt || !Array.isArray(p?.orders) || p.orders.length === 0) return null;
    const ageMs = Date.now() - p.savedAt;
    if (ageMs > CACHE_TTL_MS) return null;
    return { ageMinutes: Math.round(ageMs / 60000) };
  } catch {
    return null;
  }
}