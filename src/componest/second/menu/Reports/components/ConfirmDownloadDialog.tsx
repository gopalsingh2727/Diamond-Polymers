import { createPortal } from 'react-dom';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DOWNLOAD DIALOG
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  format: 'JSON' | 'CSV' | 'ZIP';
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const icons: Record<string, string> = { JSON: '📄', CSV: '📊', ZIP: '🗜' };
const descs: Record<string, string> = {
  JSON: 'Raw orders data file',
  CSV:  'Spreadsheet — open in Excel or Google Sheets',
  ZIP:  'Full report bundle (HTML + data + template)',
};

export function ConfirmDownloadDialog({ format, count, onConfirm, onCancel }: Props) {
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(15,17,23,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px 24px', width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{icons[format]}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Download {format}</div>
        <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 6 }}>{descs[format]}</div>
        <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#374151', margin: '10px 0 20px' }}>
          📦 {count.toLocaleString()} orders
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '11px', borderRadius: 9, border: 'none', background: '#3b82f6', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            ✓ Download {format}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
