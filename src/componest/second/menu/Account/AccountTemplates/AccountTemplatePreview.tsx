import { useState, useRef, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { AccountData } from '../Account';
import './AccountTemplates.css';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  category?: string;
  htmlHeader?: string;
  htmlBody?: string;
  htmlFooter?: string;
  css?: string;
  js?: string;
}

interface Props {
  template: DashboardType;
  accounts: AccountData[];
  onBack: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mustache renderer (same logic as Reports module)
// ─────────────────────────────────────────────────────────────────────────────
function renderMustache(template: string, context: Record<string, any>): string {
  if (!template) return '';
  let result = template.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_m, key: string, inner: string) => {
      const arr = context[key];
      if (!Array.isArray(arr) || arr.length === 0) return '';
      return arr
        .map((item: any, index: number) => {
          let row = inner;
          row = row.replace(/\{\{@index\}\}/g, String(index + 1));
          row = row.replace(/\{\{([\w\s]+)\}\}/g, (_m2: string, k: string) => {
            const v = item[k.trim()];
            return v != null ? String(v) : '';
          });
          return row;
        })
        .join('');
    },
  );
  return result.replace(/\{\{([\w\s]+)\}\}/g, (_m: string, key: string) => {
    const v = context[key.trim()];
    return v == null ? '' : String(v);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Build context from accounts data
// ─────────────────────────────────────────────────────────────────────────────
function buildAccountContext(accounts: AccountData[]): Record<string, any> {
  const now = new Date();
  const uniqueStates = new Set(accounts.map(a => a.state).filter(Boolean));

  // State-wise breakdown
  const byState: Record<string, number> = {};
  accounts.forEach(a => {
    const s = a.state || 'Unknown';
    byState[s] = (byState[s] || 0) + 1;
  });

  const branchName = localStorage.getItem('branchName') || 'Main Branch';

  return {
    accounts,
    totalAccounts: accounts.length,
    totalStates: uniqueStates.size,
    byState,
    generatedAt: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    generatedTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    companyName: branchName,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Build full HTML document
// ─────────────────────────────────────────────────────────────────────────────
function buildFullHtml(
  dt: DashboardType,
  context: Record<string, any>,
): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',sans-serif;}${dt.css || ''}</style></head><body>
${renderMustache(dt.htmlHeader || '', context)}${renderMustache(dt.htmlBody || '', context)}${renderMustache(dt.htmlFooter || '', context)}
<script>${dt.js || ''}<\/script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const AccountTemplatePreview = ({ template, accounts, onBack }: Props) => {
  const [full, setFull] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [codeTab, setCodeTab] = useState<'header' | 'body' | 'footer' | 'css' | 'js'>('body');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const context = buildAccountContext(accounts);

  const buildHtml = useCallback(() => {
    return buildFullHtml(template, context);
  }, [template, context]);

  const hasTpl = !!(template.htmlHeader || template.htmlBody || template.htmlFooter);

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const frame = printFrameRef.current;
    if (!frame) { iframeRef.current?.contentWindow?.print(); return; }
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(buildHtml()); doc.close();
    setTimeout(() => {
      try { frame.contentWindow?.focus(); frame.contentWindow?.print(); } catch {}
    }, 350);
  };

  // ── Download HTML ─────────────────────────────────────────────────────────
  const handleDownloadHtml = () => {
    try {
      const html = buildHtml();
      const blob = new Blob([html], { type: 'text/html' });
      saveAs(blob, `${template.typeCode}_accounts.html`);
    } catch (e: any) {
      alert(`Download failed: ${e?.message}`);
    }
  };

  // ── Download CSV ──────────────────────────────────────────────────────────
  const handleDownloadCsv = () => {
    try {
      const headers = ['Company Name', 'First Name', 'Last Name', 'Phone', 'Phone 2', 'WhatsApp', 'Telephone', 'Email', 'Address 1', 'Address 2', 'State', 'Pin Code'];
      const esc = (v: any): string => {
        const s = v == null ? '' : String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const rows = [
        headers.map(esc).join(','),
        ...accounts.map(a => [
          a.companyName, a.firstName, a.lastName, a.phone1, a.phone2 || '', a.whatsapp || '',
          a.telephone || '', a.email, a.address1, a.address2 || '', a.state, a.pinCode,
        ].map(esc).join(',')),
      ];
      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${template.typeCode}_accounts.csv`);
    } catch (e: any) {
      alert(`CSV download failed: ${e?.message}`);
    }
  };

  // ── Refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = () => setPreviewKey(k => k + 1);

  return (
    <div className={`act-preview-wrap ${full ? 'act-preview-wrap--full' : ''}`}>
      {/* Toolbar */}
      <div className="act-preview-bar">
        <div className="act-preview-bar__left">
          <button className="act-preview-back" onClick={onBack}>← Back</button>
          <div>
            <span className="act-preview-name">{template.typeName}</span>
            <span className="act-preview-code"> · {template.typeCode}</span>
          </div>
          <span className="act-preview-badge act-preview-badge--accounts">
            {accounts.length.toLocaleString()} accounts
          </span>
        </div>
        <div className="act-preview-bar__right">
          <button className="act-preview-tool" onClick={handleRefresh}>Refresh</button>
          <button className="act-preview-tool" onClick={handlePrint} disabled={!hasTpl}>Print</button>
          <button className="act-preview-tool" onClick={handleDownloadHtml} disabled={!hasTpl}>HTML</button>
          <button className="act-preview-tool" onClick={handleDownloadCsv}>CSV</button>
          <button
            className={`act-preview-tool ${showCode ? 'act-preview-tool--active' : ''}`}
            onClick={() => setShowCode(v => !v)}
          >
            {showCode ? 'Hide Code' : 'View Code'}
          </button>
          <button className="act-preview-tool" onClick={() => setFull(f => !f)}>
            {full ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Preview Body */}
      <div className="act-preview-body">
        {showCode ? (
          /* ── Template Code Panel ──────────────────────────────────── */
          <div className="act-code-panel">
            <div className="act-code-tabs">
              {(['header', 'body', 'footer', 'css', 'js'] as const).map(tab => (
                <button
                  key={tab}
                  className={`act-code-tab ${codeTab === tab ? 'act-code-tab--active' : ''}`}
                  onClick={() => setCodeTab(tab)}
                >
                  {tab.toUpperCase()}
                  {tab === 'header' && template.htmlHeader ? ' *' : ''}
                  {tab === 'body' && template.htmlBody ? ' *' : ''}
                  {tab === 'footer' && template.htmlFooter ? ' *' : ''}
                  {tab === 'css' && template.css ? ' *' : ''}
                  {tab === 'js' && template.js ? ' *' : ''}
                </button>
              ))}
            </div>
            <pre className="act-code-content">
              {codeTab === 'header' && (template.htmlHeader || '(empty)')}
              {codeTab === 'body' && (template.htmlBody || '(empty)')}
              {codeTab === 'footer' && (template.htmlFooter || '(empty)')}
              {codeTab === 'css' && (template.css || '(empty)')}
              {codeTab === 'js' && (template.js || '(empty)')}
            </pre>
          </div>
        ) : !hasTpl ? (
          <div className="act-state-box">
            <div style={{ fontSize: 48 }}>&#128196;</div>
            <div style={{ fontWeight: 700, color: '#94a3b8' }}>No template content</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              This template has no HTML header, body, or footer defined.
            </div>
          </div>
        ) : (
          <iframe
            key={previewKey}
            ref={iframeRef}
            title="account-template-preview"
            className="act-preview-iframe"
            srcDoc={buildHtml()}
            sandbox="allow-scripts allow-same-origin"
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
};

export default AccountTemplatePreview;
