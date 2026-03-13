import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getDashboardTypesV2 as getDashboardTypes } from '../../../../redux/dashbroadtype/dashboardTypeActions';
import { AppDispatch } from '../../../../../store';

import { DashboardType } from '../types';
import { S } from '../styles';
import { fmtDisplay, CATEGORY_COLORS } from '../utils/template';
import { DownloadMenu } from './DownloadMenu';
import { SavedFilesPanel } from './SavedFilesPanel';
import { BackButton } from '@/componest/allCompones/BackButton';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Template List
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  fromDate: string;
  toDate: string;
  onSelect: (dt: DashboardType) => void;
  onChangeDates: () => void;
  onRefreshData: () => void;
  cacheInfo: string | null;
  orderCount: number;
  reduxOrders: any[];
}

export function TemplateList({
  fromDate, toDate, onSelect, onChangeDates, onRefreshData, cacheInfo, orderCount, reduxOrders,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const dashboardTypeState = useSelector((state: any) => state.v2?.dashboardType ?? state.dashboardType ?? {});
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

  const [search,    setSearch]    = useState('');
  const [showFiles, setShowFiles] = useState(false);

  useEffect(() => { if (templates.length === 0) dispatch(getDashboardTypes()); }, [dispatch]);

  const filtered = templates.filter(dt =>
    (dt.typeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (dt.typeCode  || '').toLowerCase().includes(search.toLowerCase()) ||
    (dt.category  || '').toLowerCase().includes(search.toLowerCase())
  );

  const dateLabel = fromDate
    ? fmtDisplay(fromDate) + (toDate ? ' — ' + fmtDisplay(toDate) : '')
    : 'All Time';

  return (
    <div style={S.listPage}>
      {showFiles && (
        <SavedFilesPanel
          onClose={() => setShowFiles(false)}
          onLoad={(_from, _to) => { setShowFiles(false); }}
        />
      )}

      {/* Header */}
      <div style={S.listHeader}>
        <div style={S.listHeaderLeft}>
          <BackButton/>
          <span style={S.listTitle}>📊 Dashboard Reports</span>
          <span style={S.dateBadge}>📅 {dateLabel}</span>
          <span style={S.countBadge}>{filtered.length} templates</span>
          {orderCount > 0 && (
            <span style={{ ...S.countBadge, background: '#dcfce7', color: '#15803d' }}>
              📦 {orderCount.toLocaleString()} orders
            </span>
          )}
          {cacheInfo && <span style={S.cacheBadge}>⚡ {cacheInfo}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <DownloadMenu fromDate={fromDate} toDate={toDate} reduxOrders={reduxOrders} />
          <button style={{ ...S.secondaryBtn, background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }} onClick={() => setShowFiles(true)}>
            💿 Saved Files
          </button>
          <button style={S.secondaryBtn} onClick={onRefreshData}>🔄 Refresh</button>
          <button style={S.secondaryBtn} onClick={() => dispatch(getDashboardTypes())}>↻ Templates</button>
          <button style={S.secondaryBtn} onClick={onChangeDates}>✏️ Dates</button>
        </div>
      </div>

      {/* Search */}
      <div style={S.searchBarWrap}>
        <div style={S.searchBar}>
          <span style={{ fontSize: 16, color: '#94a3b8' }}>🔍</span>
          <input
            type="text" placeholder="Search templates…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={S.searchInput}
          />
          {search && <button onClick={() => setSearch('')} style={S.clearBtn}>✕</button>}
        </div>
      </div>

      {/* Body */}
      {loading && (
        <div style={S.stateBox}><div style={S.spinner} /><span>Loading templates…</span></div>
      )}
      {!loading && error && (
        <div style={{ ...S.stateBox, color: '#ef4444' }}>⚠️ {error}</div>
      )}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div style={S.stateBox}>
            <div style={{ fontSize: 48 }}>📭</div>
            <div style={{ fontWeight: 700, color: '#374151', fontSize: 16 }}>
              {search ? `No results for "${search}"` : 'No dashboard templates yet'}
            </div>
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map(dt => {
              const c = CATEGORY_COLORS[dt.category || 'other'] || CATEGORY_COLORS.other;
              const hasTpl = !!(dt.htmlHeader || dt.htmlBody || dt.htmlFooter);
              return (
                <div key={dt._id} style={S.card} onClick={() => onSelect(dt)}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={S.cardTopRow}>
                    <span style={{ ...S.catBadge, background: c.bg, color: c.color }}>
                      <span style={{ ...S.catDot, background: c.dot }} />
                      {(dt.category || 'other').charAt(0).toUpperCase() + (dt.category || 'other').slice(1)}
                    </span>
                    <span style={{ ...S.tplBadge, background: hasTpl ? '#dcfce7' : '#f3f4f6', color: hasTpl ? '#15803d' : '#9ca3af' }}>
                      {hasTpl ? '✓ Has Template' : 'No Template'}
                    </span>
                  </div>
                  <div style={S.cardName}>{dt.typeName}</div>
                  <div style={S.cardCode}>{dt.typeCode}</div>
                  {dt.description && <div style={S.cardDesc}>{dt.description}</div>}
                  <div style={S.cardFooter}>
                    <span style={S.cardParts}>
                      {[dt.htmlHeader && 'Header', dt.htmlBody && 'Body', dt.htmlFooter && 'Footer', dt.css && 'CSS', dt.js && 'JS']
                        .filter(Boolean).join(' · ') || 'Empty'}
                    </span>
                    <span style={S.openBtn}>Open →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}