import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardTypesV2 as getDashboardTypes } from '../../../../redux/dashbroadtype/dashboardTypeActions';
import { AppDispatch } from '../../../../../store';
import { DashboardType } from '../types';
import { S } from '../styles';
import { fmtDisplay, CATEGORY_COLORS } from '../utils/template';
import { BackButton } from '@/componest/allCompones/BackButton';

interface Props {
  fromDate:      string;
  toDate:        string;
  onSelect:      (dt: DashboardType) => void;
  onChangeDates: () => void;
  onRefreshData: () => void;
  cacheInfo:     string | null;
  orderCount:    number;
  reduxOrders:   any[];
}

export function TemplateList({
  fromDate, toDate, onSelect, onChangeDates, onRefreshData, cacheInfo, orderCount, reduxOrders,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const dashboardTypeState = useSelector(
    (state: any) => state.v2?.dashboardType ?? state.dashboardType ?? {},
  );
  const rawList = dashboardTypeState?.list;
  const templates: DashboardType[] = Array.isArray(rawList)
    ? rawList
    : Array.isArray(rawList?.data)
    ? rawList.data
    : Array.isArray(rawList?.data?.data)
    ? rawList.data.data
    : [];

  const loading = dashboardTypeState?.loading || false;
  const error   = dashboardTypeState?.error   || null;

  const [search, setSearch] = useState('');

  // ✅ FIX Bug 6: added templates.length to deps so refetch fires after cache clear
  useEffect(() => {
    if (templates.length === 0 && !loading) {
      dispatch(getDashboardTypes());
    }
  }, [dispatch, templates.length, loading]);

  const filtered = templates.filter(dt =>
    (dt.typeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (dt.typeCode  || '').toLowerCase().includes(search.toLowerCase()) ||
    (dt.category  || '').toLowerCase().includes(search.toLowerCase()),
  );

  const dateLabel = fromDate
    ? fmtDisplay(fromDate) + (toDate ? ' — ' + fmtDisplay(toDate) : '')
    : 'All Time';

  return (
    <div style={S.listPage}>

      {/* Header */}
      <div style={S.listHeader}>
        <div style={S.listHeaderLeft}>
          <BackButton />
          <span style={S.listTitle}>Dashboard Reports</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {cacheInfo && (
            <span style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
              {cacheInfo}
            </span>
          )}
          <button style={S.secondaryBtn} onClick={onRefreshData}>↻ Refresh Data</button>
          <button style={S.secondaryBtn} onClick={onChangeDates}>📅 Change Dates</button>
          <button style={S.secondaryBtn} onClick={() => dispatch(getDashboardTypes())}>↻ Templates</button>
        </div>
      </div>

      {/* Date / order info bar */}
      {fromDate && (
        <div style={{
          padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          fontSize: 12, color: '#64748b', display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <span>📅 {dateLabel}</span>
          {orderCount > 0 && <span>✓ {orderCount.toLocaleString()} orders cached</span>}
        </div>
      )}

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <input
          style={{
            width: '100%', maxWidth: 360, padding: '8px 12px',
            border: '1px solid #e2e8f0', borderRadius: 8,
            fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
          placeholder="Search templates…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          <div style={S.bigSpinner} />
          <div style={{ marginTop: 16 }}>Loading templates…</div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ color: '#ef4444', marginTop: 8 }}>Failed to load templates</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{error}</div>
          <button style={{ ...S.confirmBtn, marginTop: 16 }} onClick={() => dispatch(getDashboardTypes())}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <div style={{ marginTop: 8 }}>No templates found</div>
          {search && (
            <button style={{ ...S.secondaryBtn, marginTop: 12 }} onClick={() => setSearch('')}>
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Template Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div style={S.grid}>
          {filtered.map(dt => {
            const cat   = CATEGORY_COLORS[dt.category || ''] || CATEGORY_COLORS['other'];
            const color = cat.color;
            const bg    = cat.bg;
            const dot   = cat.dot;
            return (
              <div
                key={dt._id ?? dt.typeCode}
                style={S.card}
                onClick={() => onSelect(dt)}
              >
                {/* coloured left accent */}
                <div style={{ width: 4, height: '100%', minHeight: 70, background: dot, borderRadius: 4, flexShrink: 0, position: 'absolute', left: 0, top: 0, bottom: 0 }} />
                <div style={{ paddingLeft: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {dt.typeName || dt.typeCode}
                  </div>
                  {dt.typeCode && (
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', fontWeight: 600, marginBottom: 6 }}>
                      {dt.typeCode}
                    </div>
                  )}
                  {dt.category && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 9px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                      background: bg, color,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                      {dt.category}
                    </span>
                  )}
                  {dt.description && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                      {dt.description}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 'auto', paddingLeft: 14, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>Open →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}