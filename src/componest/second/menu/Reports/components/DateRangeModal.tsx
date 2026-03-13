import { useState } from 'react';
import { BackButton } from '@/componest/allCompones/BackButton';
import { S } from '../styles';
import { readCacheMeta } from '../utils/cache';
import { todayStr, monthStartStr, lastNDays } from '../utils/template';
import { SavedFilesPanel } from './SavedFilesPanel';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Date Range Modal
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onConfirm: (from: string, to: string) => void;
}

const PRESETS = [
  { label: 'Today',        from: () => todayStr(),      to: () => todayStr() },
  { label: 'This Month',   from: () => monthStartStr(), to: () => todayStr() },
  { label: 'Last 7 Days',  from: () => lastNDays(7),    to: () => todayStr() },
  { label: 'Last 30 Days', from: () => lastNDays(30),   to: () => todayStr() },
  { label: 'All Time',     from: () => '',              to: () => '' },
];

export function DateRangeModal({ onConfirm }: Props) {
  const [from, setFrom] = useState(monthStartStr());
  const [to,   setTo]   = useState(todayStr());
  const [showFiles, setShowFiles] = useState(false);

  const presets = PRESETS.map(p => ({ label: p.label, from: p.from(), to: p.to() }));
  const isActive = (p: { from: string; to: string }) => p.from === from && p.to === to;
  const cached = readCacheMeta(from, to);

  return (
    <div style={S.overlay}>
      {/* Saved Files Panel — rendered on top when open */}
      {showFiles && (
        <SavedFilesPanel
          onClose={() => setShowFiles(false)}
          onLoad={(savedFrom, savedTo) => {
            if (savedFrom) setFrom(savedFrom);
            if (savedTo)   setTo(savedTo);
            setShowFiles(false);
          }}
        />
      )}

      <BackButton />

      <div style={S.modal}>
        <div style={{ fontSize: 44, textAlign: 'center' }}>📅</div>
        <div style={S.modalTitle}>Select Date Range</div>
        <div style={S.modalSub}>Choose the period for your dashboard report</div>

        <div style={S.presetRow}>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => { setFrom(p.from); setTo(p.to); }}
              style={{ ...S.presetBtn, ...(isActive(p) ? S.presetActive : {}) }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={S.dateRow}>
          <div style={S.dateField}>
            <label style={S.dateLabel}>From</label>
            <input
              type="date" style={S.dateInput} value={from}
              max={to || undefined}
              onChange={e => setFrom(e.target.value)}
            />
          </div>
          <div style={{ alignSelf: 'flex-end', paddingBottom: 10, color: '#94a3b8', fontSize: 18 }}>→</div>
          <div style={S.dateField}>
            <label style={S.dateLabel}>To</label>
            <input
              type="date" style={S.dateInput} value={to}
              min={from || undefined}
              onChange={e => setTo(e.target.value)}
            />
          </div>
        </div>

        {cached && (
          <div style={S.cacheHint}>
            ⚡ Cached data available ({cached.ageMinutes}min ago) — will load instantly
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            style={{
              ...S.secondaryBtn,
              flex: '0 0 auto',
              background: '#f0fdf4',
              borderColor: '#bbf7d0',
              color: '#15803d',
            }}
            onClick={() => setShowFiles(true)}
          >
            💿 Saved Files
          </button>

          <button
            style={{ ...S.confirmBtn, flex: 1, marginTop: 0 }}
            onClick={() => onConfirm(from, to)}
          >
            {cached ? '⚡ Load from Cache →' : 'Fetch Dashboard Data →'}
          </button>
        </div>
      </div>
    </div>
  );
}