import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { CacheFile } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// SAVED FILES PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onLoad: (fromDate: string, toDate: string) => void;
}

export function SavedFilesPanel({ onClose, onLoad }: Props) {
  const [files,    setFiles]    = useState<CacheFile[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const cache = (window as any).dashboardCache;

  useEffect(() => {
    if (!cache?.list) { setLoading(false); return; }
    cache.list().then((r: any) => { setFiles(r?.files || []); setLoading(false); });
  }, []);

  const handleDelete = async (file: CacheFile) => {
    if (!confirm(`Delete ${file.filename}?\n${file.total} orders · ${file.sizeKB} KB`)) return;
    setDeleting(file.filename);
    try {
      await cache.delete({ fromDate: file.fromDate, toDate: file.toDate });
      const key = `ordersExport_${file.fromDate || 'all'}_${file.toDate || 'all'}`;
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_meta`);
      setFiles(f => f.filter(x => x.filename !== file.filename));
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (file: CacheFile, format: 'JSON' | 'CSV') => {
    if (!cache?.download) { alert('IPC not available'); return; }
    cache.download({ fromDate: file.fromDate, toDate: file.toDate, format })
      .then((r: any) => { if (!r?.success && !r?.canceled) alert('Download failed: ' + r?.error); });
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,17,23,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>💿 Saved Data Files</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Stored in your AppData folder · Delete when no longer needed
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {cache?.openFolder && (
              <button onClick={() => cache.openFolder()} style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                📂 Open Folder
              </button>
            )}
            <button onClick={onClose} style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading…</div>
          )}

          {!loading && !cache?.list && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 40 }}>⚠️</div>
              <div style={{ fontWeight: 700, color: '#374151', marginTop: 8 }}>IPC not connected</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                Ensure <code>ipcHandlers</code> are registered in main.ts
              </div>
            </div>
          )}

          {!loading && cache?.list && files.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 40 }}>📭</div>
              <div style={{ fontWeight: 700, color: '#374151', marginTop: 8 }}>No saved files yet</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                Fetch data first — it will be saved automatically
              </div>
            </div>
          )}

          {!loading && files.map(file => (
            <div key={file.filename} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>📄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{file.filename}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {file.total.toLocaleString()} orders · {file.sizeKB} KB · saved {file.ageMinutes}min ago
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, fontFamily: 'monospace' }}>
                  {file.filepath}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => onLoad(file.fromDate, file.toDate)} style={{ padding: '5px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer' }}>
                  ⚡ Load
                </button>
                <button onClick={() => handleDownload(file, 'JSON')} style={{ padding: '5px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#15803d', cursor: 'pointer' }}>
                  ⬇ JSON
                </button>
                <button onClick={() => handleDownload(file, 'CSV')} style={{ padding: '5px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#15803d', cursor: 'pointer' }}>
                  ⬇ CSV
                </button>
                <button onClick={() => handleDelete(file)} disabled={deleting === file.filename}
                  style={{ padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#dc2626', cursor: deleting === file.filename ? 'wait' : 'pointer' }}>
                  {deleting === file.filename ? '…' : '🗑 Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
