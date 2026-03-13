import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { exportAndSaveOrders, clearDashboardReportData, buildOrdersKey } from '../../../redux/dashbroadData/dashboardreportdataactions';
import { AppDispatch } from '../../../../store';

import { DashboardType, Step } from './types';
import { readCacheMeta, readOrdersFromMemory } from './utils/cache';  
import { DateRangeModal } from './components/DateRangeModal';
import { LoadingScreen } from './components/LoadingScreen';
import { TemplateList } from './components/TemplateList';
import { LivePreview } from './components/LivePreview';

const ReportViewer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [step,      setStep]     = useState<Step>('date');
  const [fromDate,  setFrom]     = useState('');
  const [toDate,    setTo]       = useState('');
  const [selected,  setSelected] = useState<DashboardType | null>(null);
  const [cacheInfo, setCacheInfo] = useState<string | null>(null);

  const dataError   = useSelector((state: any) => state.DashboardData?.error || null);
  const reduxOrders = useSelector((state: any) => state.DashboardData?.orders || []);

  const orderCount = reduxOrders.length > 0
    ? reduxOrders.length
    : readOrdersFromMemory(fromDate, toDate).length;  // ← FIXED: was readOrdersFromLocalStorage

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

  const handleDateConfirm = async (from: string, to: string) => {
    setFrom(from);
    setTo(to);
    try { localStorage.setItem('dashboardLastParams', JSON.stringify({ fromDate: from, toDate: to })); } catch {}
    const meta = readCacheMeta(from, to);
    if (meta) { setCacheInfo(`From cache · ${meta.ageMinutes}min ago`); setStep('list'); return; }
    setCacheInfo(null);
    setStep('loading');
    try { await dispatch(exportAndSaveOrders({ fromDate: from, toDate: to }) as any); setStep('list'); } catch {}
  };

  const handleRefreshData = async () => {
    try {
      const key = buildOrdersKey(fromDate, toDate);
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_meta`);
    } catch {}
    setCacheInfo(null);
    setStep('loading');
    try { await dispatch(exportAndSaveOrders({ fromDate, toDate }) as any); setStep('list'); } catch {}
  };

  const handleChangeDates = () => {
    dispatch(clearDashboardReportData() as any);
    setCacheInfo(null);
    setStep('date');
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      {step === 'date'    && <DateRangeModal onConfirm={handleDateConfirm} />}
      {step === 'loading' && <LoadingScreen fromDate={fromDate} toDate={toDate} error={dataError} onRetry={() => handleDateConfirm(fromDate, toDate)} onChangeDates={handleChangeDates} />}
      {step === 'list'    && <TemplateList fromDate={fromDate} toDate={toDate} onSelect={(dt) => { setSelected(dt); setStep('preview'); }} onChangeDates={handleChangeDates} onRefreshData={handleRefreshData} cacheInfo={cacheInfo} orderCount={orderCount} reduxOrders={reduxOrders} />}
      {step === 'preview' && selected && <LivePreview template={selected} fromDate={fromDate} toDate={toDate} onBack={() => setStep('list')} reduxOrders={reduxOrders} />}
    </div>
  );
};

export default ReportViewer;