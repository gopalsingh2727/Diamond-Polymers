import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BackButton } from '@/componest/allCompones/BackButton';

// ─── GraphQL helpers (same pattern as graphqlOrderActions.ts) ─────────────────
const BASE_URL = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000';
const API_KEY  = import.meta.env.VITE_API_KEY as string;

function resolveToken() { return localStorage.getItem('authToken') || ''; }
function resolveBranchId() {
  try {
    const t = localStorage.getItem('authToken');
    if (t) { const p = JSON.parse(atob(t.split('.')[1])); if (p.branchId) return p.branchId; }
  } catch { /* ignore */ }
  return localStorage.getItem('selectedBranch') || localStorage.getItem('branchId') || '';
}

function gqlHeaders() {
  const h: Record<string, string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${resolveToken()}`,
  };
  if (API_KEY) h['x-api-key'] = API_KEY;
  const b = resolveBranchId();
  if (b) h['x-selected-branch'] = b;
  return h;
}

const GQL_GET_ORDERS = `
  query GetOrders($filter: OrderFilter!, $sortBy: String, $sortDir: String) {
    orders(filter: $filter, sortBy: $sortBy, sortDir: $sortDir) {
      orders
      total
    }
  }
`;

async function fetchOrdersForDashboard(fromDate?: string, toDate?: string): Promise<any[]> {
  const branchId = resolveBranchId();
  const filter: Record<string, any> = { branchId };
  if (fromDate) filter.fromDate = fromDate;
  if (toDate)   filter.toDate   = toDate;

  const res = await fetch(`${BASE_URL}/graphql`, {
    method: 'POST',
    headers: gqlHeaders(),
    body: JSON.stringify({ query: GQL_GET_ORDERS, variables: { filter, sortBy: 'createdAt', sortDir: 'desc' } }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
  const json = await res.json();
  const raw = json?.data?.orders?.orders;
  if (!raw) return [];
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return Array.isArray(raw) ? raw : [];
}

// ─── Analytics computed from raw orders ──────────────────────────────────────
function computeStats(orders: any[]) {
  // Status counts
  const statusMap: Record<string, number> = {};
  for (const o of orders) {
    const s = o.overallStatus || 'unknown';
    statusMap[s] = (statusMap[s] || 0) + 1;
  }
  const byStatus = Object.entries(statusMap)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // Monthly trend — group by YYYY-MM
  const monthMap: Record<string, number> = {};
  for (const o of orders) {
    const d = o.createdAt ? new Date(o.createdAt) : null;
    if (!d || isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  }
  const monthly = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, count]) => ({ period, count }));

  // Top customers by order count
  const custMap: Record<string, number> = {};
  for (const o of orders) {
    const name = (o.customer?.companyName || o.customer?.name || o.customerId || 'Unknown') as string;
    custMap[name] = (custMap[name] || 0) + 1;
  }
  const topCustomers = Object.entries(custMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.slice(0, 22), count }));

  // Machine usage from steps
  const machineMap: Record<string, { total: number; completed: number; pending: number }> = {};
  for (const o of orders) {
    const steps = Array.isArray(o.steps) ? o.steps : [];
    for (const step of steps) {
      const mName = step.machineName || step.machineId || 'Unknown';
      if (!machineMap[mName]) machineMap[mName] = { total: 0, completed: 0, pending: 0 };
      machineMap[mName].total++;
      const s = (step.status || '').toLowerCase();
      if (s === 'completed' || s === 'done') machineMap[mName].completed++;
      else machineMap[mName].pending++;
    }
  }
  const machines = Object.entries(machineMap)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 8)
    .map(([name, v]) => ({ name: name.slice(0, 16), ...v }));

  // Top options
  const optionMap: Record<string, number> = {};
  for (const o of orders) {
    const opts = Array.isArray(o.options) ? o.options : [];
    for (const opt of opts) {
      const n = opt.optionName || opt.name || opt.optionId || 'Unknown';
      optionMap[n] = (optionMap[n] || 0) + 1;
    }
  }
  const topOptions = Object.entries(optionMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.slice(0, 22), count }));

  return { totalOrders: orders.length, byStatus, monthly, topCustomers, machines, topOptions };
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending:              '#f59e0b',
  approved:             '#3b82f6',
  'Wait for Approval':  '#8b5cf6',
  in_progress:          '#06b6d4',
  completed:            '#10b981',
  dispatched:           '#22d3ee',
  cancelled:            '#ef4444',
  issue:                '#f97316',
  default:              '#6b7280',
};
const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#22d3ee'];

const PRESET_LABELS: Record<string, string> = {
  this_month: 'This Month',
  last_month: 'Last Month',
  last_7:     'Last 7 Days',
  last_30:    'Last 30 Days',
  this_year:  'This Year',
  all:        'All Time',
};

function presetDates(preset: string): { from?: string; to?: string } {
  const now   = new Date();
  const pad   = (n: number) => String(n).padStart(2, '0');
  const fmt   = (d: Date)   => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'this_month': return { from: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), to: fmt(today) };
    case 'last_month': return {
      from: fmt(new Date(today.getFullYear(), today.getMonth()-1, 1)),
      to:   fmt(new Date(today.getFullYear(), today.getMonth(), 0)),
    };
    case 'last_7': { const s = new Date(today); s.setDate(s.getDate()-6); return { from: fmt(s), to: fmt(today) }; }
    case 'last_30': { const s = new Date(today); s.setDate(s.getDate()-29); return { from: fmt(s), to: fmt(today) }; }
    case 'this_year': return { from: `${today.getFullYear()}-01-01`, to: fmt(today) };
    default: return {};
  }
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderLeft: `4px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140, flex: '1 1 140px',
    }}>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</span>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Preset = 'this_month' | 'last_month' | 'last_7' | 'last_30' | 'this_year' | 'all';

export default function LiveDashboard() {
  const [stats,     setStats]     = useState<ReturnType<typeof computeStats> | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [preset,    setPreset]    = useState<Preset>('this_month');
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [rawCount,  setRawCount]  = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { from, to } = presetDates(preset);
      const orders = await fetchOrdersForDashboard(from, to);
      setRawCount(orders.length);
      setStats(computeStats(orders));
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [preset]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const get = (status: string) => stats?.byStatus.find(s => s.status === status)?.count ?? 0;
  const pending    = get('pending') + get('Wait for Approval');
  const approved   = get('approved');
  const inProgress = get('in_progress');
  const completed  = get('completed');
  const dispatched = get('dispatched');
  const cancelled  = get('cancelled');

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: '#1e293b', color: '#fff', padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,.18)', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton />
          <span style={{ fontWeight: 800, fontSize: 18 }}>Live Dashboard</span>
          {lastFetch && (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Updated {lastFetch.toLocaleTimeString('en-IN')} · {rawCount} orders
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {(Object.keys(PRESET_LABELS) as Preset[]).map(p => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: 'none',
                background: preset === p ? '#3b82f6' : '#334155',
                color: '#fff',
              }}
            >
              {PRESET_LABELS[p]}
            </button>
          ))}
          <button
            onClick={fetchAll}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: 24 }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            Loading orders via GraphQL…
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#ef4444' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            {error}
            <div style={{ marginTop: 16 }}>
              <button onClick={fetchAll} style={{ padding: '8px 20px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          </div>
        )}

        {stats && !loading && (
          <>
            {/* ── Stat Cards ── */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              <StatCard label="Total Orders"  value={stats.totalOrders} color="#3b82f6" />
              <StatCard label="Pending"       value={pending}           color="#f59e0b" sub="incl. Wait for Approval" />
              <StatCard label="Approved"      value={approved}          color="#3b82f6" />
              <StatCard label="In Progress"   value={inProgress}        color="#06b6d4" />
              <StatCard label="Completed"     value={completed}         color="#10b981" />
              <StatCard label="Dispatched"    value={dispatched}        color="#22d3ee" />
              <StatCard label="Cancelled"     value={cancelled}         color="#ef4444" />
            </div>

            {/* ── Row 1: Monthly Trend + Status Pie ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

              <Section title="Orders Over Time">
                {stats.monthly.length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No timeline data for this period</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={stats.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Section>

              <Section title="Status Breakdown">
                {stats.byStatus.length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No orders</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={stats.byStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%" cy="50%"
                        outerRadius={80}
                        label={({ status, percent }) =>
                          `${(status as string).replace('Wait for Approval','WFA')} ${((percent as number)*100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {stats.byStatus.map((entry, i) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            {/* ── Row 2: Top Customers + Machine Usage ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

              <Section title="Top Customers by Orders">
                {stats.topCustomers.length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No customer data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.topCustomers} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Section>

              <Section title="Machine Usage">
                {stats.machines.length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No step/machine data in orders</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.machines}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="completed" fill="#10b981" name="Completed" stackId="a" />
                      <Bar dataKey="pending"   fill="#f59e0b" name="Pending"   stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            {/* ── Row 3: Top Options + Status Table ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <Section title="Top Order Options / Items">
                {stats.topOptions.length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No option data in orders</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.topOptions} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Section>

              <Section title="Status Summary">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left',  color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Count</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byStatus.map(row => (
                      <tr key={row.status} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                              background: STATUS_COLORS[row.status] || '#6b7280', flexShrink: 0,
                            }} />
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{row.count}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#6b7280' }}>
                          {stats.totalOrders ? ((row.count / stats.totalOrders) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700 }}>Total</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{stats.totalOrders}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>100%</td>
                    </tr>
                  </tfoot>
                </table>
              </Section>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
