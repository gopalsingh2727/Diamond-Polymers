import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DashboardType, Step } from './types';
import { AppDispatch } from '../../../../store';
import { readCacheMeta, readOrdersFromMemory } from './utils/cache';
import { TemplateList } from './components/TemplateList';
import { LivePreview } from './components/LivePreview';

const ReportViewer = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [step,      setStep]     = useState<Step>('list');
  const [fromDate,  setFrom]     = useState('');
  const [toDate,    setTo]       = useState('');
  const [selected,  setSelected] = useState<DashboardType | null>(null);
  const [cacheInfo, setCacheInfo] = useState<string | null>(null);

  // ✅ FIX Bug 1: pull real orders from Redux instead of hardcoded []
  // ✅ FIX TypeError: wrap with Array.isArray guard — Redux may return an object,
  //    null, or undefined before data loads; buildTemplateContext calls .forEach on this
  const reduxOrders: any[] = useSelector((state: any) => {
    const raw =
      state.orders?.list ??
      state.orders?.data ??
      state.v2?.orders ??
      null;
    return Array.isArray(raw) ? raw : [];
  });

  // ✅ FIX Bug 2: orderCount is reactive to fromDate/toDate, not computed at module-level
  const orderCount = fromDate ? readOrdersFromMemory(fromDate, toDate).length : 0;

  // ── Restore last session from cache on mount ─────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('dashboardLastParams');
      if (!raw) return;
      const last = JSON.parse(raw);
      const meta = readCacheMeta(last.fromDate, last.toDate);
      if (!meta) return;
      setFrom(last.fromDate);
      setTo(last.toDate);
      setCacheInfo(`From cache · ${meta.ageMinutes}min ago`);
      setStep('list');
    } catch {}
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleDateConfirm = (from: string, to: string) => {
    setFrom(from);
    setTo(to);
    try {
      localStorage.setItem('dashboardLastParams', JSON.stringify({ fromDate: from, toDate: to }));
    } catch {}
    const meta = readCacheMeta(from, to);
    setCacheInfo(meta ? `From cache · ${meta.ageMinutes}min ago` : null);
    setStep('list');
  };

  // ✅ FIX Bug 4: clears cache properly
  const handleRefreshData = () => {
    try {
      const key = `orders_${fromDate}_${toDate}`;
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_meta`);
    } catch {}
    setCacheInfo(null);
    // dispatch(fetchOrders({ fromDate, toDate })); // plug in your fetch action here
    setStep('list');
  };

  const handleChangeDates = () => {
    setCacheInfo(null);
    setSelected(null); // ✅ FIX Bug 5: clear stale selected when dates change
    setStep('list');
  };

  // ✅ FIX Bug 5: clear selected when returning from preview → list
  const handleBackFromPreview = () => {
    setSelected(null);
    setStep('list');
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      {step === 'list' && (
        <TemplateList
          fromDate={fromDate}
          toDate={toDate}
          onSelect={(dt) => { setSelected(dt); setStep('preview'); }}
          onChangeDates={handleChangeDates}
          onRefreshData={handleRefreshData}
          cacheInfo={cacheInfo}
          orderCount={orderCount}
          reduxOrders={reduxOrders}  // ✅ FIX Bug 1: real orders
        />
      )}

      {step === 'preview' && selected && (
        <LivePreview
          template={selected}
          fromDate={fromDate}
          toDate={toDate}
          onBack={handleBackFromPreview}  // ✅ FIX Bug 5
          reduxOrders={reduxOrders}       // ✅ FIX Bug 1: real orders
        />
      )}
    </div>
  );
};

export default ReportViewer;