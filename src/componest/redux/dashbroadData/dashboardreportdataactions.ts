/**
 * Dashboard Report Data Actions
 *
 * Storage architecture (no localStorage for order data — avoids 5MB limit):
 *
 *   PRIMARY  → disk file via IPC (window.dashboardCache)
 *              Stored in: AppData/YourApp/dashboardCache/orders_from_to.json
 *
 *   MEMORY   → module-level Map, survives navigation but not app restart
 *              readOrdersFromCache() checks this first (instant, zero I/O)
 *
 *   METADATA → localStorage stores ONLY { total, savedAt } per date range
 *              (~200 bytes per entry, never hits size limit)
 *              Used by UI to show "⚡ cached N orders" badge without reading disk
 */

import {
  DASHBOARD_REPORT_FETCH_REQUEST,
  DASHBOARD_REPORT_FETCH_SUCCESS,
  DASHBOARD_REPORT_FETCH_FAILURE,
  DASHBOARD_REPORT_CLEAR,
} from './dashboardReportDataConstants';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY CACHE  (module scope — survives React re-renders & navigation)
// ─────────────────────────────────────────────────────────────────────────────
interface MemCacheEntry {
  orders:   any[];
  total:    number;
  fromDate: string;
  toDate:   string;
  savedAt:  number;
}
const memCache = new Map<string, MemCacheEntry>();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getCache() { return (window as any).dashboardCache || null; }

export function buildOrdersKey(fromDate: string, toDate: string) {
  return `ordersExport_${fromDate || 'all'}_${toDate || 'all'}`;
}

/** Write only tiny metadata to localStorage — never the full orders array */
function writeMetaToLocalStorage(fromDate: string, toDate: string, total: number, savedAt: number) {
  const metaKey = `${buildOrdersKey(fromDate, toDate)}_meta`;
  try {
    localStorage.setItem(metaKey, JSON.stringify({ total, fromDate, toDate, savedAt }));
  } catch {}
}

function readMetaFromLocalStorage(fromDate: string, toDate: string): { total: number; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(`${buildOrdersKey(fromDate, toDate)}_meta`);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p?.savedAt) return null;
    return p;
  } catch { return null; }
}

async function parseGzipResponse(res: Response) {
  try { const json = await res.clone().json(); console.log('✅ Response decoded automatically by browser'); return json; } catch {}
  try {
    const text = await res.clone().text();
    const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(text.trim());
    if (isBase64) {
      const binary = atob(text.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter(); const reader = ds.readable.getReader();
      writer.write(bytes); writer.close();
      const chunks: Uint8Array[] = []; let done = false;
      while (!done) { const { value, done: d } = await reader.read(); if (value) chunks.push(value); done = d; }
      console.log('✅ Manual gzip decode successful');
      return JSON.parse(new TextDecoder().decode(new Uint8Array(chunks.reduce((a: number[], b) => [...a, ...b], []))));
    }
    return JSON.parse(text);
  } catch (e: any) { throw new Error(`Failed to parse Lambda response: ${e.message}`); }
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSIST — two paths:
//
//  persistToCacheFromText(s3Text)  ← PRIMARY for S3 flow
//    Passes the raw S3 response string to main process unchanged.
//    No re-serialization of the orders array → no "Invalid string length".
//
//  persistToCache(orders)          ← FALLBACK for direct Lambda flow
//    Only used when orders arrive directly (small datasets, no S3 raw text).
//    Still avoids IPC for large arrays by capping at 5000 orders.
// ─────────────────────────────────────────────────────────────────────────────

export async function persistToCacheFromText(
  fromDate: string,
  toDate: string,
  s3Text: string,    // raw text from S3 — passed straight to disk, never re-serialized
  total: number,
  orders: any[],     // already parsed, used for in-memory cache only
) {
  const savedAt = Date.now();
  const key     = buildOrdersKey(fromDate, toDate);

  // 1. Memory (instant)
  memCache.set(key, { orders, total, fromDate, toDate, savedAt });
  console.log(`🧠 Saved ${orders.length} orders to memory (key: ${key})`);

  // 2. Metadata only to localStorage
  writeMetaToLocalStorage(fromDate, toDate, total, savedAt);

  // 3. Disk — send raw text string, NOT the parsed array
  const cache = getCache();
  if (cache?.saveFromText) {
    try {
      const result = await cache.saveFromText({ fromDate, toDate, s3Text, total, savedAt });
      if (result?.success) {
        console.log(`💿 Saved to disk via saveFromText (${orders.length} orders)`);
        return { disk: true };
      }
      console.warn('[Cache] saveFromText returned failure:', result?.error);
    } catch (e: any) {
      console.warn('[Cache] saveFromText threw:', e.message);
    }
  } else if (cache?.save && orders.length <= 5000) {
    // Fallback: small dataset — safe to pass as object
    try {
      await cache.save({ fromDate, toDate, orders, total, savedAt });
      console.log(`💿 Saved to disk via save (small dataset)`);
      return { disk: true };
    } catch (e: any) {
      console.warn('[Cache] disk save threw:', e.message);
    }
  } else if (!cache) {
    console.warn('⚠️ window.dashboardCache not available — orders in memory only');
  }

  return { disk: false };
}

async function persistToCache(fromDate: string, toDate: string, orders: any[], total: number) {
  const savedAt = Date.now();
  const key     = buildOrdersKey(fromDate, toDate);

  // 1. Memory
  memCache.set(key, { orders, total, fromDate, toDate, savedAt });
  console.log(`🧠 Saved ${orders.length} orders to memory (key: ${key})`);

  // 2. Metadata only to localStorage
  writeMetaToLocalStorage(fromDate, toDate, total, savedAt);

  // 3. Disk — only if small enough to safely pass through IPC
  const cache = getCache();
  if (cache?.save && orders.length <= 5000) {
    try {
      const result = await cache.save({ fromDate, toDate, orders, total, savedAt });
      if (result?.success) {
        console.log(`💿 Saved ${orders.length} orders to disk`);
        return { disk: true };
      }
    } catch (e: any) {
      console.warn('[Cache] disk save threw:', e.message);
    }
  } else if (cache && orders.length > 5000) {
    console.warn(`⚠️ ${orders.length} orders too large for IPC object transfer — disk save skipped. Use S3 flow.`);
  }

  return { disk: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ ORDERS — memory first, then disk, never localStorage
// ─────────────────────────────────────────────────────────────────────────────
export async function readOrdersFromCache(fromDate: string, toDate: string): Promise<any[]> {
  const key = buildOrdersKey(fromDate, toDate);

  // 1. Check memory
  const mem = memCache.get(key);
  if (mem) {
    const age = Date.now() - mem.savedAt;
    if (age <= CACHE_TTL_MS) {
      console.log(`🧠 Orders from memory (${Math.round(age / 60000)}min old) | ${mem.orders.length} orders`);
      return mem.orders;
    }
    memCache.delete(key);
  }

  // 2. Check disk via IPC
  const cache = getCache();
  if (cache) {
    try {
      const result = await cache.read({ fromDate, toDate });
      if (result?.success && Array.isArray(result.orders) && result.orders.length > 0) {
        const age = Date.now() - (result.savedAt || 0);
        if (age <= CACHE_TTL_MS) {
          // Warm memory cache from disk
          memCache.set(key, { orders: result.orders, total: result.total, fromDate, toDate, savedAt: result.savedAt });
          console.log(`💿 Orders from disk (${Math.round(age / 60000)}min old) | ${result.orders.length} orders`);
          return result.orders;
        }
      }
    } catch (e: any) {
      console.warn('[Cache] disk read failed:', e.message);
    }
  }

  return [];
}

/** Synchronous version — memory only. Use for UI count badges. */
export function readOrdersFromMemory(fromDate: string, toDate: string): any[] {
  const key = buildOrdersKey(fromDate, toDate);
  const mem = memCache.get(key);
  if (!mem) return [];
  if (Date.now() - mem.savedAt > CACHE_TTL_MS) { memCache.delete(key); return []; }
  return mem.orders;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. EXPORT FULL ORDERS  (GET /v2/dashboardData/download)
// ─────────────────────────────────────────────────────────────────────────────
export const exportAndSaveOrders = (
  params: { fromDate?: string; toDate?: string } = {}
) => async (dispatch: any) => {
  const token  = localStorage.getItem('authToken');
  const branch = localStorage.getItem('selectedBranch');
  const query  = new URLSearchParams();
  if (params.fromDate) query.append('fromDate', params.fromDate);
  if (params.toDate)   query.append('toDate',   params.toDate);

  dispatch({ type: DASHBOARD_REPORT_FETCH_REQUEST });
  console.log('📤 Requesting export from Lambda…');
  console.log('📅 Params:', { fromDate: params.fromDate, toDate: params.toDate });

  let lambdaRes: Response;
  try {
    lambdaRes = await fetch(`${baseUrl}/v2/dashboardData/download?${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key':     API_KEY,
        'Content-Type':  'application/json',
        ...(branch ? { 'x-selected-branch': branch } : {}),
      },
    });
    console.log('📡 Lambda status:', lambdaRes.status, lambdaRes.statusText);
  } catch (networkErr: any) {
    const msg = `Network error: ${networkErr.message}`;
    dispatch({ type: DASHBOARD_REPORT_FETCH_FAILURE, payload: msg });
    throw new Error(msg);
  }

  if (!lambdaRes.ok) {
    const msg = `Lambda failed: ${lambdaRes.status} ${lambdaRes.statusText}`;
    dispatch({ type: DASHBOARD_REPORT_FETCH_FAILURE, payload: msg });
    throw new Error(msg);
  }

  const xCache = lambdaRes.headers.get('x-cache') || 'UNKNOWN';
  console.log(`📨 Lambda responded | X-Cache: ${xCache}`);

  let lambdaJson: any;
  try { lambdaJson = await parseGzipResponse(lambdaRes); }
  catch (e: any) { dispatch({ type: DASHBOARD_REPORT_FETCH_FAILURE, payload: e.message }); throw e; }

  console.log('📨 Lambda JSON shape:', {
    success: lambdaJson.success, total: lambdaJson.total,
    hasUrl: !!lambdaJson.downloadUrl, hasOrders: Array.isArray(lambdaJson.orders), xCache,
  });

  if (!lambdaJson.success) {
    const msg = lambdaJson.message || 'Export failed';
    dispatch({ type: DASHBOARD_REPORT_FETCH_FAILURE, payload: msg });
    throw new Error(msg);
  }

  // ── S3 presigned URL flow ─────────────────────────────────────────────────
  if (lambdaJson.downloadUrl) {
    console.log(`📦 ${lambdaJson.total} orders | expires: ${lambdaJson.expiresIn || '15min'}`);
    let s3Orders: any[] = [];
    try {
      console.log('📡 Fetching from S3…');
      const s3Res = await fetch(lambdaJson.downloadUrl);
      console.log('📡 S3 status:', s3Res.status, s3Res.statusText);
      if (!s3Res.ok) throw new Error(`S3 failed: ${s3Res.status}`);
      const s3Text = await s3Res.text();
      console.log(`✅ S3 body size: ${(s3Text.length / 1024).toFixed(1)} KB`);
      s3Orders = JSON.parse(s3Text)?.orders || [];
      console.log(`✅ Parsed ${s3Orders.length} orders from S3`);

      // KEY: save raw s3Text string to disk — avoids re-serializing the array
      await persistToCacheFromText(
        params.fromDate || '', params.toDate || '',
        s3Text, lambdaJson.total, s3Orders
      );
    } catch (s3Err: any) {
      console.error('❌ S3 error:', s3Err.message);
      dispatch({ type: DASHBOARD_REPORT_FETCH_FAILURE, payload: s3Err.message });
      return { total: lambdaJson.total, orders: [], fallback: true };
    }
    dispatch({ type: DASHBOARD_REPORT_FETCH_SUCCESS, payload: { orders: s3Orders, total: lambdaJson.total, fromDate: lambdaJson.fromDate, toDate: lambdaJson.toDate } });
    console.log(`✅ Done — ${lambdaJson.total} orders in Redux + memory + disk`);
    return { total: lambdaJson.total, orders: s3Orders, fromDate: lambdaJson.fromDate, toDate: lambdaJson.toDate, fallback: false };
  }

  // ── Direct orders flow ────────────────────────────────────────────────────
  if (Array.isArray(lambdaJson.orders)) {
    dispatch({ type: DASHBOARD_REPORT_FETCH_SUCCESS, payload: { orders: lambdaJson.orders, total: lambdaJson.total, fromDate: lambdaJson.fromDate, toDate: lambdaJson.toDate } });
    await persistToCache(params.fromDate || '', params.toDate || '', lambdaJson.orders, lambdaJson.total);
    console.log(`✅ Done — ${lambdaJson.total} orders in Redux + memory + disk`);
    return { total: lambdaJson.total, orders: lambdaJson.orders, fromDate: lambdaJson.fromDate, toDate: lambdaJson.toDate, fallback: false };
  }

  dispatch({ type: DASHBOARD_REPORT_FETCH_FAILURE, payload: 'Unexpected response shape' });
  throw new Error('Export failed — no downloadUrl and no orders array');
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. LOAD FROM CACHE — memory first, then disk
// ─────────────────────────────────────────────────────────────────────────────
export const loadCachedDashboardData = (
  params: { fromDate?: string; toDate?: string } = {}
) => async (dispatch: any) => {
  const orders = await readOrdersFromCache(params.fromDate || '', params.toDate || '');
  if (orders.length === 0) return false;

  const key  = buildOrdersKey(params.fromDate || '', params.toDate || '');
  const meta = readMetaFromLocalStorage(params.fromDate || '', params.toDate || '');
  const ageMinutes = meta?.savedAt ? Math.round((Date.now() - meta.savedAt) / 60000) : 0;

  dispatch({
    type:    DASHBOARD_REPORT_FETCH_SUCCESS,
    payload: { orders, total: meta?.total || orders.length, fromDate: params.fromDate, toDate: params.toDate },
  });
  console.log(`⚡ Loaded ${orders.length} orders from cache (${ageMinutes}min old)`);
  return { ageMinutes, total: meta?.total || orders.length };
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET CACHE META  (metadata only — no I/O, instant)
// ─────────────────────────────────────────────────────────────────────────────
export const getSavedOrdersMeta = (fromDate: string, toDate: string) => {
  // Check memory first
  const key = buildOrdersKey(fromDate, toDate);
  const mem = memCache.get(key);
  if (mem && Date.now() - mem.savedAt <= CACHE_TTL_MS) {
    return { total: mem.total, fromDate, toDate, savedAt: mem.savedAt, ageMinutes: Math.round((Date.now() - mem.savedAt) / 60000), expired: false };
  }
  // Fall back to localStorage metadata
  const meta = readMetaFromLocalStorage(fromDate, toDate);
  if (!meta) return null;
  const ageMs = Date.now() - meta.savedAt;
  return { total: meta.total, fromDate, toDate, savedAt: meta.savedAt, ageMinutes: Math.round(ageMs / 60000), expired: ageMs > CACHE_TTL_MS };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. CLEAR REDUX STATE
// ─────────────────────────────────────────────────────────────────────────────
export const clearDashboardReportData = () => (dispatch: any) => {
  dispatch({ type: DASHBOARD_REPORT_CLEAR });
};