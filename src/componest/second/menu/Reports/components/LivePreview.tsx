import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BackButton } from '@/componest/allCompones/BackButton';
import { DashboardType } from '../types';
import { S } from '../styles';
import { AppDispatch } from '../../../../../store';
import { triggerBlobDownload } from '../utils/download';
import { fmtDisplay, buildTemplateContext, buildFullHtml } from '../utils/template';
import {
  resetOrders,
  getWindowXScript,
  handleIframeQuery,
} from '@/componest/redux/graphql/graphqlOrderActions';

// Fetch HTML from Firebase Storage URL and inject window.x bridge
async function fetchFirebaseHtml(fileUrl: string, xScript: string): Promise<string> {
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`Firebase fetch failed: ${res.status}`);
  let html = await res.text();
  if (!html.includes('wx-iframe') && !html.includes('window.x =')) {
    const tag = `\n<script>\n${xScript}\n</script>\n`;
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${tag}</body>`) : html + tag;
  }
  return html;
}

interface Props {
  template:    DashboardType;
  fromDate:    string;
  toDate:      string;
  onBack:      () => void;  // ✅ caller (ReportViewer) now calls setSelected(null) before setStep
  reduxOrders: any[];       // ✅ real orders from Redux, not hardcoded []
}

export function LivePreview({ template, fromDate, toDate, onBack, reduxOrders }: Props) {
  const dispatch   = useDispatch<AppDispatch>();
  const [full,     setFull]          = useState(false);
  const [previewKey, setPreviewKey]  = useState(0);
  const [fbHtml,   setFbHtml]        = useState<string | null>(null);  // fetched from Firebase
  const [fbLoading, setFbLoading]    = useState(false);
  const [fbError,  setFbError]       = useState<string | null>(null);
  const iframeRef     = useRef<HTMLIFrameElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const orders  = Array.isArray(reduxOrders) ? reduxOrders : [];
  const context = buildTemplateContext(fromDate, toDate, orders, {});

  // ── Fetch from Firebase Storage when fileUrl is set ─────────────────────
  useEffect(() => {
    if (!template.fileUrl) { setFbHtml(null); return; }
    setFbLoading(true); setFbError(null);
    fetchFirebaseHtml(template.fileUrl, getWindowXScript())
      .then(html => { setFbHtml(html); setFbLoading(false); })
      .catch(err  => { setFbError(err.message); setFbLoading(false); });
  }, [template.fileUrl]);

  // ── Build HTML for manual templates (no Firebase file) ───────────────────
  const buildHtml = useCallback(() => {
    const base    = buildFullHtml(template, context);
    const xScript = `\n<script>\n${getWindowXScript()}\n</script>\n`;
    if (base.includes('</body>')) return base.replace('</body>', `${xScript}</body>`);
    return base + xScript;
  }, [template, context]);

  // Resolved HTML — Firebase takes priority over manual template
  const resolvedHtml = fbHtml ?? buildHtml();

  // ── postMessage bridge ───────────────────────────────────────────────────
  useEffect(() => {
    const onMessage = (e: MessageEvent) => handleIframeQuery(e);
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // ── Reset redux orders when entering / leaving ───────────────────────────
  useEffect(() => {
    dispatch(resetOrders());
    return () => { dispatch(resetOrders()); };
  }, [dispatch]);

  // ── Refresh ──────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    dispatch(resetOrders());
    if (template.fileUrl) {
      setFbHtml(null); setFbLoading(true); setFbError(null);
      fetchFirebaseHtml(template.fileUrl, getWindowXScript())
        .then(html => { setFbHtml(html); setFbLoading(false); setPreviewKey(k => k + 1); })
        .catch(err  => { setFbError(err.message); setFbLoading(false); });
    } else {
      setPreviewKey(k => k + 1);
    }
  };

  // ── Print via hidden iframe ───────────────────────────────────────────────
  const handlePrint = () => {
    const frame = printFrameRef.current;
    if (!frame) { iframeRef.current?.contentWindow?.print(); return; }
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(resolvedHtml); doc.close();
    setTimeout(() => {
      try { frame.contentWindow?.focus(); frame.contentWindow?.print(); } catch {}
    }, 350);
  };

  const hasTpl = !!(template.fileUrl || template.htmlHeader || template.htmlBody || template.htmlFooter);
  const dateLabel = fromDate
    ? fmtDisplay(fromDate) + (toDate ? ' — ' + fmtDisplay(toDate) : '')
    : 'All Time';

  return (
    <div style={{ ...S.previewWrap, ...(full ? S.previewFull : {}) }}>

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
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
            background: '#6366f122', color: '#818cf8', border: '1px solid #6366f144',
          }}>
            ⚡ window.x active
          </span>
        </div>

        <div style={S.previewBarRight}>
          <button style={S.toolBtn} onClick={handleRefresh}>🔄 Refresh</button>
          <button
            style={S.toolBtn}
            onClick={handlePrint}
            disabled={!hasTpl}
          >
            🖨 Print
          </button>
          <button
            style={S.toolBtn}
            onClick={() => triggerBlobDownload(
              resolvedHtml,
              `${template.typeCode}_${fromDate || 'all'}_${toDate || 'all'}.html`,
              'text/html',
            )}
            disabled={!hasTpl || fbLoading}
          >
            ⬇ HTML
          </button>
          <button style={S.toolBtn} onClick={() => setFull(f => !f)}>
            {full ? '⊡ Exit' : '⊞ Full'}
          </button>
        </div>
      </div>

      <div style={S.previewBody}>
        {fbLoading ? (
          <div style={S.stateBox}>
            <div style={S.bigSpinner} />
            <div style={{ fontWeight: 600, color: '#94a3b8', marginTop: 12 }}>Loading from Firebase…</div>
            {template.fileName && (
              <div style={{ fontSize: 11, color: '#64748b' }}>{template.fileName}</div>
            )}
          </div>
        ) : fbError ? (
          <div style={S.stateBox}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <div style={{ fontWeight: 700, color: '#ef4444' }}>Failed to load file</div>
            <div style={{ fontSize: 12, color: '#64748b', maxWidth: 400, textAlign: 'center' }}>{fbError}</div>
            <button style={{ ...S.toolBtn, marginTop: 12 }} onClick={handleRefresh}>🔄 Retry</button>
          </div>
        ) : !hasTpl ? (
          <div style={S.stateBox}>
            <div style={{ fontSize: 48 }}>📄</div>
            <div style={{ fontWeight: 700, color: '#94a3b8' }}>No template content</div>
          </div>
        ) : (
          <iframe
            key={previewKey}
            ref={iframeRef}
            title="dashboard-live"
            style={S.iframe}
            srcDoc={resolvedHtml}
            sandbox="allow-scripts allow-forms allow-popups allow-modals"
          />
        )}
      </div>

      {/* Hidden print frame */}
      <iframe
        ref={printFrameRef}
        title="print-frame"
        style={{ position: 'fixed', right: 0, bottom: 0, width: 0, height: 0, border: 'none', visibility: 'hidden' }}
      />
    </div>
  );
}