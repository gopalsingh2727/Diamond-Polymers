import { S } from '../styles';
import { fmtDisplay } from '../utils/template';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Loading Screen
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  fromDate: string;
  toDate: string;
  error: string | null;
  onRetry: () => void;
  onChangeDates: () => void;
}

export function LoadingScreen({ fromDate, toDate, error, onRetry, onChangeDates }: Props) {
  const dateLabel = fromDate
    ? fmtDisplay(fromDate) + (toDate ? ' — ' + fmtDisplay(toDate) : '')
    : 'All Time';

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{ fontSize: 44 }}>⚠️</div>
            <div style={{ ...S.modalTitle, color: '#ef4444', marginBottom: 8 }}>Failed to Load Data</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{error}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...S.confirmBtn, background: '#3b82f6', flex: 1 }} onClick={onRetry}>
                🔄 Retry
              </button>
              <button style={{ ...S.confirmBtn, background: '#64748b', flex: 1 }} onClick={onChangeDates}>
                ← Change Dates
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={S.bigSpinner} />
            <div style={{ ...S.modalTitle, marginTop: 20 }}>Fetching Orders…</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>📅 {dateLabel}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
              Downloading from server — this may take a moment for large datasets…
            </div>
          </>
        )}
      </div>
    </div>
  );
}
