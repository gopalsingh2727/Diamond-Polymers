/**
 * Dashboard Report Data Reducer
 *
 * Data source: /v2/orders/export (S3) — summary built locally in actions
 *
 * FIX: isValid check relaxed — payload with orders[] is always valid.
 * Previous check accidentally rejected valid payloads in some cases.
 */
import {
  DASHBOARD_REPORT_FETCH_REQUEST,
  DASHBOARD_REPORT_FETCH_SUCCESS,
  DASHBOARD_REPORT_FETCH_FAILURE,
  DASHBOARD_REPORT_CLEAR,
} from './dashboardReportDataConstants';

const initialState = {
  loading:   false,
  error:     null,
  fromCache: false,
  generatedAt:    null,
  fromDate:       null,
  toDate:         null,
  queryMs:        null,

  // Full orders array (from S3 export)
  orders:         [] as any[],
  customers:      [] as any[],
  tableDatas:     [] as any[],
  dashboardTypes: [] as any[],

  // Counts (computed from orders in actions)
  totalOrders:    0,
  totalCustomers: 0,
  totalTables:    0,
  statusCounts:   {} as Record<string, number>,

  // Full summary object — all {{mustache}} variables for templates
  summary: {} as Record<string, any>,

  // Quick-access arrays
  categoryBreakdown: [] as any[],
  topOrders:         [] as any[],
  stepPerformance:   [] as any[],
};

const dashboardReportDataReducer = (state = initialState, action: any) => {
  switch (action.type) {

    case DASHBOARD_REPORT_FETCH_REQUEST:
      return { ...state, loading: true, error: null };

    case DASHBOARD_REPORT_FETCH_SUCCESS: {
      const d = action.payload;

      if (!d || typeof d !== 'object') {
        console.warn('[Reducer] Empty payload — keeping state');
        return { ...state, loading: false, error: null };
      }

      // FIX: relaxed validity check — having ANY of these makes it valid.
      // Previously this was too strict and could reject a {orders:[...]} payload
      // if totalOrders happened to be 0 or summary was empty.
      const isValid =
        Array.isArray(d.orders)              ||  // any orders array (even empty is ok)
        (d.totalOrders ?? 0) > 0             ||
        Object.keys(d.summary || {}).length > 0  ||
        d.categoryBreakdown?.length > 0;

      if (!isValid) {
        console.warn('[Reducer] Payload has no usable data — keeping state', d);
        return { ...state, loading: false, error: null };
      }

      console.log('[Reducer] FETCH_SUCCESS — orders:', d.orders?.length ?? 0);

      return {
        ...state,
        loading:   false,
        error:     null,
        fromCache: d.fromCache || false,
        generatedAt: d.generatedAt || state.generatedAt,
        fromDate:    d.fromDate    || state.fromDate,
        toDate:      d.toDate      || state.toDate,
        queryMs:     d.queryMs     ?? state.queryMs,

        // Orders — use new payload if it's a non-empty array; keep existing otherwise
        // FIX: use d.orders if it's provided (even if empty), don't silently drop it
        orders:         Array.isArray(d.orders)         ? d.orders         : state.orders,
        customers:      Array.isArray(d.customers)      ? d.customers      : state.customers,
        tableDatas:     Array.isArray(d.tableDatas)     ? d.tableDatas     : state.tableDatas,
        dashboardTypes: Array.isArray(d.dashboardTypes) ? d.dashboardTypes : state.dashboardTypes,

        // Counts
        totalOrders:    d.totalOrders    ?? state.totalOrders,
        totalCustomers: d.totalCustomers ?? state.totalCustomers,
        totalTables:    d.totalTables    ?? state.totalTables,
        statusCounts:   Object.keys(d.statusCounts || {}).length
          ? d.statusCounts
          : state.statusCounts,

        // Summary
        summary: Object.keys(d.summary || {}).length ? d.summary : state.summary,

        // Quick-access arrays
        categoryBreakdown:
          d.categoryBreakdown?.length           ? d.categoryBreakdown          :
          d.summary?.categoryBreakdown?.length  ? d.summary.categoryBreakdown  :
          state.categoryBreakdown,

        topOrders:
          d.topOrders?.length                   ? d.topOrders                  :
          d.summary?.topOrders?.length          ? d.summary.topOrders          :
          state.topOrders,

        stepPerformance:
          d.stepPerformance?.length             ? d.stepPerformance            :
          d.summary?.stepPerformance?.length    ? d.summary.stepPerformance    :
          state.stepPerformance,
      };
    }

    case DASHBOARD_REPORT_FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload || 'Something went wrong' };

    case DASHBOARD_REPORT_CLEAR:
      return { ...initialState };

    default:
      return state;
  }
};

export default dashboardReportDataReducer;