// ─────────────────────────────────────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function monthStartStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function lastNDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return d.toISOString().split('T')[0];
}

export function fmtDisplay(s: string): string {
  if (!s) return 'All time';
  return new Date(s).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE CONTEXT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function buildTemplateContext(
  fromDate: string,
  toDate: string,
  orders: any[],
  extra: any = {}
): Record<string, any> {
  const now = new Date();
  const statusCounts: Record<string, number> = {};
  orders.forEach((o: any) => {
    const s = o.overallStatus || 'unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const branchName = extra?.branchName || 'Main Branch';
  return {
    orders,
    total: orders.length,
    totalOrders: orders.length,
    totalCustomers: extra?.totalCustomers || 0,
    statusCounts,
    dateFrom: fromDate || 'All',
    dateTo: toDate || 'All',
    periodLabel: fromDate
      ? `${fmtDisplay(fromDate)} – ${fmtDisplay(toDate)}`
      : 'All Time',
    generatedAt:   now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    generatedTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    companyName: branchName,
    companyAddress: extra?.companyAddress || '',
    companyPhone: extra?.companyPhone || '',
    companyEmail: extra?.companyEmail || '',
    branchName,
    branchCode: extra?.branchCode || '',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MUSTACHE RENDERER
// ─────────────────────────────────────────────────────────────────────────────

export function renderMustache(template: string, context: Record<string, any>): string {
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
    }
  );
  return result.replace(/\{\{([\w\s]+)\}\}/g, (_m: string, key: string) => {
    const v = context[key.trim()];
    return v == null ? '' : String(v);
  });
}

export function buildFullHtml(
  dt: { htmlHeader?: string; htmlBody?: string; htmlFooter?: string; css?: string; js?: string },
  context: Record<string, any>
): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',sans-serif;}${dt.css || ''}</style></head><body>
${renderMustache(dt.htmlHeader || '', context)}${renderMustache(dt.htmlBody || '', context)}${renderMustache(dt.htmlFooter || '', context)}
<script>${dt.js || ''}<\/script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  analytics:  { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  operations: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  finance:    { bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
  customer:   { bg: '#fce7f3', color: '#be185d', dot: '#ec4899' },
  production: { bg: '#ede9fe', color: '#7c3aed', dot: '#a855f7' },
  management: { bg: '#ffedd5', color: '#c2410c', dot: '#f97316' },
  inventory:  { bg: '#e0f2fe', color: '#0369a1', dot: '#0ea5e9' },
  other:      { bg: '#f3f4f6', color: '#4b5563', dot: '#6b7280' },
};
