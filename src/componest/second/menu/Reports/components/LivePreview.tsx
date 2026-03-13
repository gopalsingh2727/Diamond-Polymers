import { useState, useEffect, useRef } from 'react';
import { BackButton } from '@/componest/allCompones/BackButton';
import { DashboardType } from '../types';
import { S } from '../styles';
import { readOrdersFromMemory } from '../utils/cache';   // ← FIXED: was readOrdersFromLocalStorage, wrong file
import { triggerBlobDownload } from '../utils/download';
import { fmtDisplay, buildTemplateContext, buildFullHtml } from '../utils/template';
import { DownloadMenu } from './DownloadMenu';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Live Preview
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  template: DashboardType;
  fromDate: string;
  toDate: string;
  onBack: () => void;
  reduxOrders: any[];
}

export function LivePreview({ template, fromDate, toDate, onBack, reduxOrders }: Props) {
  const [full, setFull] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Prefer localStorage (fast, always up to date), fall back to Redux
  const memOrders = readOrdersFromMemory(fromDate, toDate);
  const orders    = memOrders.length > 0 ? memOrders : reduxOrders;
  const context   = buildTemplateContext(fromDate, toDate, orders, {});

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (doc) { doc.open(); doc.write(buildFullHtml(template, context)); doc.close(); }
  }, [template, context]);

  const hasTpl    = !!(template.htmlHeader || template.htmlBody || template.htmlFooter);
  const dateLabel = fromDate
    ? fmtDisplay(fromDate) + (toDate ? ' — ' + fmtDisplay(toDate) : '')
    : 'All Time';

  return (
    <div style={{ ...S.previewWrap, ...(full ? S.previewFull : {}) }}>
      <BackButton />
      <div style={S.previewBar}>
        <div style={S.previewBarLeft}>
          <button style={S.backBtn} onClick={onBack}>← Back</button>
          <div>
            <span style={S.previewName}>{template.typeName}</span>
            <span style={S.previewCode}> · {template.typeCode}</span>
          </div>
          <span style={S.dateBadge}>📅 {dateLabel}</span>
          <span style={{ ...S.dateBadge, background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d' }}>
            ✓ {orders.length.toLocaleString()} orders
          </span>
        </div>
        <div style={S.previewBarRight}>
          <button
            style={S.toolBtn}
            onClick={() => iframeRef.current?.contentWindow?.print()}
            disabled={!hasTpl}
          >
            🖨 Print
          </button>
          <button
            style={S.toolBtn}
            onClick={() => triggerBlobDownload(
              buildFullHtml(template, context),
              `${template.typeCode}_${fromDate || 'all'}_${toDate || 'all'}.html`,
              'text/html'
            )}
            disabled={!hasTpl}
          >
            ⬇ HTML
          </button>
          <DownloadMenu
            fromDate={fromDate} toDate={toDate}
            template={template} context={context}
            dark reduxOrders={reduxOrders}
          />
          <button style={S.toolBtn} onClick={() => setFull(f => !f)}>
            {full ? '⊡ Exit' : '⊞ Full'}
          </button>
        </div>
      </div>

      <div style={S.previewBody}>
        {!hasTpl ? (
          <div style={S.stateBox}>
            <div style={{ fontSize: 48 }}>📄</div>
            <div style={{ fontWeight: 700, color: '#94a3b8' }}>No template content</div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="dashboard-live"
            style={S.iframe}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
}