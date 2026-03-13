/**
 * download.ts
 *
 * Handles all file download logic for ReportViewer.
 *
 * Key fix: JSON.stringify on large order arrays (10k+ orders) hits JS engine
 * string length limits and throws "Invalid string length". We work around this
 * by building the JSON manually in chunks and writing directly into the Blob
 * constructor's array (which accepts multiple parts — no concatenation needed).
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { DashboardType } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// CHUNKED JSON BLOB
// Builds  { "orders": [...], "total": N, "fromDate": "...", "toDate": "..." }
// without ever concatenating the full string — passes array of parts to Blob.
// ─────────────────────────────────────────────────────────────────────────────
const CHUNK_SIZE = 500; // orders per chunk

function buildJsonBlob(orders: any[], fromDate: string, toDate: string): Blob {
  const header = `{\n  "total": ${orders.length},\n  "fromDate": ${JSON.stringify(fromDate)},\n  "toDate": ${JSON.stringify(toDate)},\n  "orders": [\n`;
  const footer = `\n  ]\n}`;

  const parts: (string | Uint8Array)[] = [header];

  for (let i = 0; i < orders.length; i += CHUNK_SIZE) {
    const chunk = orders.slice(i, i + CHUNK_SIZE);
    const chunkStr = chunk
      .map((o, localIdx) => {
        const globalIdx = i + localIdx;
        const comma = globalIdx < orders.length - 1 ? ',' : '';
        return '    ' + JSON.stringify(o) + comma;
      })
      .join('\n');
    parts.push(chunkStr);
    if (i + CHUNK_SIZE < orders.length) parts.push('\n');
  }

  parts.push(footer);
  return new Blob(parts, { type: 'application/json' });
}

// ─────────────────────────────────────────────────────────────────────────────
// CHUNKED CSV
// Builds CSV row-by-row to avoid one giant string concat.
// ─────────────────────────────────────────────────────────────────────────────
function buildCsvBlob(orders: any[]): Blob | null {
  if (!orders.length) return null;

  const allKeys = Array.from(
    new Set(orders.flatMap(o =>
      Object.keys(o).filter(k => typeof o[k] !== 'object' || o[k] === null)
    ))
  );

  const esc = (v: any): string => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const parts: string[] = [allKeys.map(esc).join(',') + '\n'];

  for (let i = 0; i < orders.length; i += CHUNK_SIZE) {
    const chunk = orders.slice(i, i + CHUNK_SIZE);
    parts.push(chunk.map(o => allKeys.map(k => esc(o[k])).join(',')).join('\n') + '\n');
  }

  return new Blob(parts, { type: 'text/csv;charset=utf-8;' });
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: ordersToCSV  (kept for ZIP bundling — returns string, but chunked)
// Only used internally for ZIP where we need a string, not a Blob.
// ─────────────────────────────────────────────────────────────────────────────
export function ordersToCSV(orders: any[]): string {
  if (!orders.length) return '';
  const allKeys = Array.from(
    new Set(orders.flatMap(o =>
      Object.keys(o).filter(k => typeof o[k] !== 'object' || o[k] === null)
    ))
  );
  const esc = (v: any): string => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows: string[] = [allKeys.map(esc).join(',')];
  for (let i = 0; i < orders.length; i += CHUNK_SIZE) {
    orders.slice(i, i + CHUNK_SIZE).forEach(o =>
      rows.push(allKeys.map(k => esc(o[k])).join(','))
    );
  }
  return rows.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: fallbackSave
// Called when IPC is unavailable (browser dev) or IPC returns failure.
// Uses chunked Blob — never throws "Invalid string length".
// ─────────────────────────────────────────────────────────────────────────────
export function fallbackSave(
  format: 'JSON' | 'CSV',
  orders: any[],
  slug: string,
  fromDate: string,
  toDate: string,
) {
  try {
    if (format === 'JSON') {
      const blob = buildJsonBlob(orders, fromDate, toDate);
      saveAs(blob, `${slug}.json`);
    } else {
      const blob = buildCsvBlob(orders);
      if (!blob) { alert('CSV generation failed — no data.'); return; }
      saveAs(blob, `${slug}.csv`);
    }
    console.log(`[Download] fallbackSave OK — ${format} | ${orders.length} orders`);
  } catch (e: any) {
    console.error('[Download] fallbackSave error:', e?.message);
    alert(`Download failed: ${e?.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: triggerBlobDownload  (HTML download from LivePreview toolbar)
// ─────────────────────────────────────────────────────────────────────────────
export function triggerBlobDownload(content: string, filename: string, mime = 'application/octet-stream') {
  try {
    saveAs(new Blob([content], { type: mime }), filename);
    console.log('[Download] triggerBlobDownload OK:', filename);
  } catch (e: any) {
    console.error('[Download] triggerBlobDownload failed:', e?.message);
    alert(`Download failed: ${e?.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: downloadZip
// ─────────────────────────────────────────────────────────────────────────────
function resolveIpcInvoke(): ((ch: string, ...a: any[]) => Promise<any>) | null {
  const w = window as any;
  if (typeof w?.ipcRenderer?.invoke   === 'function') return w.ipcRenderer.invoke.bind(w.ipcRenderer);
  if (typeof w?.electron?.ipcRenderer?.invoke === 'function') return w.electron.ipcRenderer.invoke.bind(w.electron.ipcRenderer);
  if (typeof w?.api?.invoke           === 'function') return w.api.invoke.bind(w.api);
  if (typeof w?.electronAPI?.invoke   === 'function') return w.electronAPI.invoke.bind(w.electronAPI);
  return null;
}

export async function downloadZip(
  dt: DashboardType,
  context: Record<string, any>,
  orders: any[],
  fromDate: string,
  toDate: string,
  setZipProgress: (s: string) => void,
) {
  const zip  = new JSZip();
  const slug = `${dt.typeCode}_${fromDate || 'all'}_${toDate || 'all'}`;
  const root = zip.folder(slug)!;

  setZipProgress('Building data…');

  // JSON — chunked, added as string parts to avoid one giant stringify
  const jsonParts: string[] = [`{\n  "total": ${orders.length},\n  "fromDate": ${JSON.stringify(fromDate)},\n  "toDate": ${JSON.stringify(toDate)},\n  "orders": [\n`];
  for (let i = 0; i < orders.length; i += CHUNK_SIZE) {
    const chunk = orders.slice(i, i + CHUNK_SIZE);
    jsonParts.push(chunk.map((o, li) => '    ' + JSON.stringify(o) + (i + li < orders.length - 1 ? ',' : '')).join('\n'));
    if (i + CHUNK_SIZE < orders.length) jsonParts.push('\n');
  }
  jsonParts.push('\n  ]\n}');
  root.file('data.json', jsonParts.join(''));

  root.file('data.csv', ordersToCSV(orders));

  // Standalone HTML report (self-contained, no server needed)
  const reportHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',sans-serif;}${dt.css || ''}</style></head><body>
<div id="__report"></div><script>
var D=${JSON.stringify(context)},H=${JSON.stringify(dt.htmlHeader||'')},B=${JSON.stringify(dt.htmlBody||'')},F=${JSON.stringify(dt.htmlFooter||'')};
function rm(t,c){if(!t)return'';var r=t.replace(/\\{\\{#(\\w+)\\}\\}([\\s\\S]*?)\\{\\{\\/\\1\\}\\}/g,function(_,k,i){var a=c[k];if(!Array.isArray(a)||!a.length)return'';return a.map(function(it,n){return i.replace(/\\{\\{@index\\}\\}/g,n+1+'').replace(/\\{\\{([\\w\\s]+)\\}\\}/g,function(_,kk){var v=it[kk.trim()];return v!=null?v+'':'';});}).join('');});return r.replace(/\\{\\{([\\w\\s]+)\\}\\}/g,function(_,k){var v=c[k.trim()];return v!=null?v+'':'';});}
document.getElementById('__report').innerHTML=rm(H,D)+rm(B,D)+rm(F,D);${dt.js || ''}
<\/script></body></html>`;

  setZipProgress('Compressing…');
  root.file('report.html', reportHtml);

  const tpl = root.folder('template')!;
  if (dt.htmlHeader) tpl.file('header.html', dt.htmlHeader);
  if (dt.htmlBody)   tpl.file('body.html',   dt.htmlBody);
  if (dt.htmlFooter) tpl.file('footer.html', dt.htmlFooter);
  if (dt.css)        tpl.file('styles.css',  dt.css);
  if (dt.js)         tpl.file('script.js',   dt.js);

  root.file('README.txt',
    `Dashboard Export\n================\nTemplate: ${dt.typeName} (${dt.typeCode})\nPeriod: ${fromDate || 'All'} → ${toDate || 'All'}\nGenerated: ${new Date().toLocaleString('en-IN')}\n\nFiles:\n  report.html\n  data.json\n  data.csv\n  template/`
  );

  // Try IPC save dialog first
  const invoke = resolveIpcInvoke();
  if (invoke) {
    try {
      const b64 = await zip.generateAsync({ type: 'base64', compression: 'DEFLATE' });
      const res = await invoke('save-file', { filename: `${slug}.zip`, content: b64 });
      if (res?.canceled) { setZipProgress('Canceled'); return; }
      if (res?.success === true || typeof res?.filePath === 'string') { setZipProgress('Done ✓'); return; }
    } catch (e: any) { console.warn('[ZIP] ipc error:', e?.message); }
  }

  // Fallback: saveAs blob
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  saveAs(blob, `${slug}.zip`);
  setZipProgress('Done ✓');
}