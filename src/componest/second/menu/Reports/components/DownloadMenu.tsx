import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DashboardType } from '../types';
import { S } from '../styles';
import { readOrdersFromMemory } from '../utils/cache';   // ← FIXED: was readOrdersFromLocalStorage
import { fallbackSave, downloadZip } from '../utils/download';

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD MENU
// Takes `reduxOrders` as a prop so it can serve large datasets that didn't
// fit in localStorage (they live in Redux state + disk only).
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  fromDate: string;
  toDate: string;
  template?: DashboardType;
  context?: Record<string, any>;
  dark?: boolean;
  reduxOrders?: any[];
}

export function DownloadMenu({
  fromDate, toDate, template, context, dark = false, reduxOrders = [],
}: Props) {
  const [open,        setOpen]        = useState(false);
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const [hovered,     setHovered]     = useState<string | null>(null);
  const [menuPos,     setMenuPos]     = useState<{ top: number; right: number } | null>(null);
  const [count,       setCount]       = useState(0);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slug = `orders_${fromDate || 'all'}_${toDate || 'all'}`;

  /**
   * Best available orders: localStorage/memory → Redux prop → []
   * readOrdersFromMemory is sync so safe to call in render / polling
   */
  const getOrders = (): any[] => {
    const mem = readOrdersFromMemory(fromDate, toDate);
    if (mem.length > 0) return mem;
    if (reduxOrders.length > 0) return reduxOrders;
    return [];
  };

  // Poll until orders appear (handles async fetch + localStorage timing)
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    const check = () => {
      const n = getOrders().length;
      if (n !== count) setCount(n);
      return n;
    };

    if (check() > 0) return;

    let attempts = 0;
    pollRef.current = setInterval(() => {
      attempts++;
      if (check() > 0 || attempts >= 150) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 400);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, reduxOrders.length]);

  // Update count when reduxOrders arrives (large datasets skip localStorage)
  useEffect(() => {
    if (reduxOrders.length > 0 && count === 0) setCount(reduxOrders.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxOrders.length]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = () => {
    const freshCount = getOrders().length;
    setCount(freshCount);
    if (freshCount === 0) {
      alert('No data yet. Please wait for the fetch to complete or try refreshing.');
      return;
    }
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setOpen(o => !o);
  };

  // saveAs fallback when IPC not available or user is in browser dev mode
  // fallbackSave is imported from download.ts — chunked, handles large datasets

  // Primary download — IPC native save dialog, falls back to saveAs
  const doDownload = (format: 'JSON' | 'CSV' | 'ZIP') => {
    setOpen(false);
    const orders = getOrders();
    if (orders.length === 0) { alert('No data. Please wait for fetch to complete.'); return; }

    const cache = (window as any).dashboardCache;

    if (format === 'JSON' || format === 'CSV') {
      if (cache?.download) {
        // IPC path: reads disk file directly in main process → native save dialog
        cache.download({ fromDate, toDate, format })
          .then((result: any) => {
            if (result?.success)  { console.log('[Download] saved to:', result.filePath); return; }
            if (result?.canceled) { return; }
            // IPC returned a failure — fall back to in-browser saveAs
            fallbackSave(format, orders, slug, fromDate, toDate);
          })
          .catch(() => fallbackSave(format, orders, slug, fromDate, toDate));
      } else {
        // No IPC (browser dev mode) — use saveAs directly
        fallbackSave(format, orders, slug, fromDate, toDate);
      }

    } else if (format === 'ZIP') {
      if (!template || !context) return;
      setZipProgress('Building…');
      downloadZip(template, { ...context, orders }, orders, fromDate, toDate, setZipProgress)
        .catch((err: any) => alert(`ZIP failed: ${err.message}`))
        .finally(() => setZipProgress(null));
    }
  };

  const triggerBtn: React.CSSProperties = {
    ...(dark ? S.toolBtn : S.secondaryBtn),
    background:  dark ? '#16a34a33' : '#dcfce7',
    color:       dark ? '#86efac'   : '#15803d',
    border:      dark ? '1px solid #22c55e55' : '1px solid #bbf7d0',
    fontWeight:  700,
    cursor:      'pointer',
    opacity:     count === 0 ? 0.6 : 1,
  };

  return (
    <>
      <button ref={btnRef} style={triggerBtn} onClick={handleToggle}>
        {zipProgress ? `⏳ ${zipProgress}` : count > 0 ? `⬇ Download (${count})` : `⬇ Download`}
      </button>

      {open && menuPos && createPortal(
        <>
          {/* backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 99990 }} onMouseDown={() => setOpen(false)} />

          {/* menu */}
          <div style={{
            position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 99999,
            background: '#fff', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,.18)',
            border: '1px solid #e2e8f0', minWidth: 220, overflow: 'hidden',
          }}>
            {/* header */}
            <div style={{ padding: '10px 16px 8px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #f1f5f9' }}>
              {count} orders · {fromDate || 'All'} → {toDate || 'All'}
            </div>

            {/* JSON */}
            <button
              style={{ ...S.menuItem, background: hovered === 'json' ? '#f8fafc' : 'transparent' }}
              onMouseEnter={() => setHovered('json')} onMouseLeave={() => setHovered(null)}
              onClick={() => doDownload('JSON')}
            >
              <span style={S.menuIcon}>📄</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>JSON</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Raw orders data</div>
              </div>
            </button>

            {/* CSV */}
            <button
              style={{ ...S.menuItem, background: hovered === 'csv' ? '#f8fafc' : 'transparent' }}
              onMouseEnter={() => setHovered('csv')} onMouseLeave={() => setHovered(null)}
              onClick={() => doDownload('CSV')}
            >
              <span style={S.menuIcon}>📊</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>CSV</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Open in Excel / Sheets</div>
              </div>
            </button>

            {/* ZIP — only shown when a template is available */}
            {template && context && (
              <button
                style={{ ...S.menuItem, background: hovered === 'zip' ? '#f8fafc' : 'transparent', borderTop: '1px solid #f1f5f9' }}
                onMouseEnter={() => setHovered('zip')} onMouseLeave={() => setHovered(null)}
                onClick={() => doDownload('ZIP')}
              >
                <span style={S.menuIcon}>🗜</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>ZIP</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Report + data + template</div>
                </div>
              </button>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
}