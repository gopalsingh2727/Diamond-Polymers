// ─────────────────────────────────────────────────────────────────────────────
//  graphqlOrderActions.ts (FIXED v2 - Correct BASE_URL for localhost:4000)
// ─────────────────────────────────────────────────────────────────────────────

import { Dispatch } from 'redux';
import {
  GRAPHQL_ORDERS_REQUEST,
  GRAPHQL_ORDERS_SUCCESS,
  GRAPHQL_ORDERS_FAILURE,
  GRAPHQL_ORDER_REQUEST,
  GRAPHQL_ORDER_SUCCESS,
  GRAPHQL_ORDER_FAILURE,
  GRAPHQL_ORDERS_RESET,
} from './graphqlOrderConstants';

const BASE_URL = import.meta.env.VITE_API_27INFINITY_IN || import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_KEY = import.meta.env.VITE_API_KEY as string;
const ORDERS_ENDPOINT = '/graphql';

export interface OrderFilter {
  branchId:            string;
  overallStatus?:      string[];
  priority?:           string[];
  customerId?:         string;
  orderTypeId?:        string;
  fromDate?:           string;
  toDate?:             string;
  scheduledStartFrom?: string;
  scheduledStartTo?:   string;
  search?:             string;
  optionId?:           string;
  optionCategory?:     string;
  sourceType?:         string;
  sameDayDispatch?:    boolean;
  includeDeleted?:     boolean;
}

export type SortableField =
  | 'createdAt' | 'updatedAt' | 'overallStatus' | 'priority'
  | 'scheduledStartDate' | 'scheduledEndDate' | 'dispatchedDate' | 'orderId';

export interface FetchOrdersParams {
  filter:   OrderFilter;
  sortBy?:  SortableField;
  sortDir?: 'asc' | 'desc';
}

// ─── GraphQL Queries (NO pagination) ──────────────────────────────────────

const GQL_GET_ORDERS = `
  query GetOrders($filter: OrderFilter!, $sortBy: String, $sortDir: String) {
    orders(filter: $filter, sortBy: $sortBy, sortDir: $sortDir) {
      orders
      total
      downloadUrl
      expiresIn
    }
  }
`;

const GQL_GET_ORDER = `
  query GetOrder($id: String!) {
    order(id: $id) {
      order
    }
  }
`;

const GQL_SPEC_AGGREGATES = `
  query GetSpecAggregates($status: [String], $priority: String, $dateFrom: String, $dateTo: String, $specNames: [String], $customerId: ID, $orderTypeId: ID) {
    getSpecificationAggregates(status: $status, priority: $priority, dateFrom: $dateFrom, dateTo: $dateTo, specNames: $specNames, customerId: $customerId, orderTypeId: $orderTypeId) {
      specName
      unit
      dataType
      totalValue
      count
      average
      orderCount
      valueCountsJson
    }
  }
`;

const GQL_OUTPUT_REPORT = `
  query GetOutputReport($overallStatus: [String], $priority: [String], $dateFrom: String, $dateTo: String, $specName: String, $specNames: [String], $columnName: String, $columnNames: [String]) {
    getOrderOutputReport(overallStatus: $overallStatus, priority: $priority, dateFrom: $dateFrom, dateTo: $dateTo, specName: $specName, specNames: $specNames, columnName: $columnName, columnNames: $columnNames) {
      orderId overallStatus priority createdAt customerId createdByName
      inputTotal outputTotal difference wastage efficiency unit
      specValues      { name value unit dataType optionName }
      colValues       { name value unit columnName }
      specValueCountsJson
      colValueCountsJson
    }
  }
`;

const GQL_OUTPUT_SUMMARY = `
  query GetOutputSummary($overallStatus: [String], $priority: [String], $dateFrom: String, $dateTo: String, $specName: String, $specNames: [String], $columnName: String, $columnNames: [String]) {
    getOrderOutputSummary(overallStatus: $overallStatus, priority: $priority, dateFrom: $dateFrom, dateTo: $dateTo, specName: $specName, specNames: $specNames, columnName: $columnName, columnNames: $columnNames) {
      totalInput totalOutput totalDifference totalWastage efficiency orderCount unit
      specValueCountsJson colValueCountsJson
      rows {
        orderId overallStatus priority createdAt customerId createdByName
        inputTotal outputTotal difference wastage efficiency unit
        specValues      { name value unit dataType optionName }
        colValues       { name value unit columnName }
        specValueCountsJson colValueCountsJson
      }
    }
  }
`;

const GQL_MACHINE_AGGREGATES = `
  query GetMachineAggregates($orderTypeId: ID, $overallStatus: [String], $priority: [String], $dateFrom: String, $dateTo: String, $machineId: ID, $machineIds: [ID]) {
    getMachineTableAggregates(orderTypeId: $orderTypeId, overallStatus: $overallStatus, priority: $priority, dateFrom: $dateFrom, dateTo: $dateTo, machineId: $machineId, machineIds: $machineIds) {
      machineId
      orderCount
      totalEntries
      totalRows
      totalProductionTime
      avgProgress
      completedCount
      completionRate
      totalSessions
      avgTargetValue
      avgCurrentValue
      machine {
        machineName
        branchId
      }
      columnTotals {
        columnName
        unit
        totalValue
        count
        average
        orderCount
      }
    }
  }
`;

const GQL_MACHINE_COLUMN_AGGREGATES = `
  query GetMachineColumnAggregates($orderTypeId: ID, $overallStatus: [String], $priority: [String], $dateFrom: String, $dateTo: String, $machineId: ID, $machineIds: [ID], $columnName: String, $columnNames: [String]) {
    getMachineColumnAggregates(orderTypeId: $orderTypeId, overallStatus: $overallStatus, priority: $priority, dateFrom: $dateFrom, dateTo: $dateTo, machineId: $machineId, machineIds: $machineIds, columnName: $columnName, columnNames: $columnNames) {
      machineId
      columnName
      unit
      totalValue
      count
      average
      orderCount
      machine {
        machineName
      }
    }
  }
`;

function resolveToken(): string {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('[graphql] authToken not found');
  return token;
}

function resolveBranchId(): string {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.branchId) return payload.branchId;
    }
  } catch { /* ignore */ }
  return (
    localStorage.getItem('selectedBranch')  ||
    localStorage.getItem('branchId')        ||
    localStorage.getItem('currentBranchId') ||
    ''
  );
}

function buildHeaders(): Record<string, string> {
  const token    = resolveToken();
  const branchId = resolveBranchId();
  const headers: Record<string, string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  if (branchId) headers['x-selected-branch'] = branchId;
  return headers;
}

async function gqlPost<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const url = `${BASE_URL}${ORDERS_ENDPOINT}`;
  
  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: buildHeaders(),
      body:    JSON.stringify({ query, variables }),
    });
    
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message ?? `HTTP ${res.status}`);
    }
    
    return res.json();
  } catch (err: any) {
    console.error(`[graphqlOrderActions] Request failed:`, {
      url,
      error: err.message,
    });
    throw err;
  }
}

function unwrapOrders(res: any): any[] {
  const result = res?.data?.orders ?? res?.orders;
  if (!result) return [];
  if (result.downloadUrl) return result;
  return result.orders ?? [];
}

function unwrapOrder(res: any): any {
  return res?.data?.order?.order ?? res?.data?.order ?? res?.order?.order ?? res?.order ?? res?.data ?? res;
}

async function _fetchAllOrders(filter: Partial<OrderFilter> = {}): Promise<any[]> {
  const branchId = filter.branchId || resolveBranchId();
  const res      = await gqlPost(GQL_GET_ORDERS, { 
    filter: { ...filter, branchId },
  });
  return unwrapOrders(res);
}

async function _fetchOrdersByStatus(status: string | string[], filter: Partial<OrderFilter> = {}): Promise<any[]> {
  const branchId      = filter.branchId || resolveBranchId();
  const overallStatus = Array.isArray(status) ? status : [status];
  const res           = await gqlPost(GQL_GET_ORDERS, { 
    filter: { ...filter, branchId, overallStatus },
  });
  return unwrapOrders(res);
}

async function _fetchOrdersByCustomer(customerId: string, filter: Partial<OrderFilter> = {}): Promise<any[]> {
  const branchId = filter.branchId || resolveBranchId();
  const res      = await gqlPost(GQL_GET_ORDERS, { 
    filter: { ...filter, branchId, customerId },
  });
  return unwrapOrders(res);
}

async function _fetchOrderById(id: string): Promise<any> {
  const res = await gqlPost(GQL_GET_ORDER, { id });
  return unwrapOrder(res);
}

// ─────────────────────────────────────────────────────────────────────────────
//  getWindowXScript
//  Injected into the iframe. Pure postMessage messenger — no credentials here.
// ─────────────────────────────────────────────────────────────────────────────

export function getWindowXScript(): string {
  return `
(function() {
  'use strict';

  var _id = 0;
  var _pending = {};

  window.addEventListener('message', function(e) {
    var msg = e.data;
    if (!msg || msg.__src !== 'wx-parent') return;
    var cb = _pending[msg.id];
    if (!cb) return;
    delete _pending[msg.id];
    if (msg.error) cb.reject(new Error(msg.error));
    else           cb.resolve(msg.data);
  });

  function _ask(descriptor) {
    return new Promise(function(resolve, reject) {
      var id = ++_id;
      _pending[id] = { resolve: resolve, reject: reject };
      window.parent.postMessage({ __src: 'wx-iframe', id: id, query: descriptor }, '*');
      setTimeout(function() {
        if (_pending[id]) {
          delete _pending[id];
          reject(new Error('window.x timeout — no response from parent'));
        }
      }, 15000);
    });
  }

  window.x = {
    fetch: async function(namedMap) {
      var keys    = Object.keys(namedMap);
      var results = await Promise.all(
        keys.map(function(k) {
          return _ask(namedMap[k]).catch(function(e) { return []; });
        })
      );
      var out = {};
      keys.forEach(function(k, i) { out[k] = results[i]; });
      return out;
    },

    run: async function(descriptors) {
      return Promise.all(
        descriptors.map(function(d) {
          return _ask(d).catch(function(e) { return []; });
        })
      );
    },

    query:         function(descriptor) { return _ask(descriptor); },
    getAllOrders:   function()         { return _ask({ type: 'all' }); },
    getByStatus:   function(status)   { return _ask({ type: 'byStatus',   status:       status }); },
    getByPriority: function(priority) { return _ask({ type: 'byPriority', priority:     priority }); },
    getByCustomer: function(name)     { return _ask({ type: 'byCustomer', customerName: name }); },
    getByFilter:   function(filter)   { return _ask({ type: 'byFilter',   filter:       filter }); },
    getOrder:      function(id)       { return _ask({ type: 'byId',       id:           id }); },

    // ── Helpers for non-numeric typed data ──────────────────────────────────

    /**
     * Parse a valueCountsJson string returned by specAggregates / outputReport.
     * Returns an array sorted by count desc: [{ value, count }, ...]
     * Example: window.x.parseValueCounts(spec.valueCountsJson)
     *   → [{ value: 'Blue', count: 12 }, { value: 'Red', count: 5 }]
     */
    parseValueCounts: function(jsonStr) {
      if (!jsonStr) return [];
      try {
        var map = JSON.parse(jsonStr);
        return Object.entries(map)
          .map(function(e) { return { value: e[0], count: e[1] }; })
          .sort(function(a, b) { return b.count - a.count; });
      } catch(e) { return []; }
    },

    /**
     * Get the most common value from a valueCountsJson string.
     * Example: window.x.topValue(spec.valueCountsJson) → 'Blue'
     */
    topValue: function(jsonStr) {
      var arr = window.x.parseValueCounts(jsonStr);
      return arr.length ? arr[0].value : null;
    },

    /**
     * From machineAggregates result, get the total for a specific column on a specific machine.
     * Example: window.x.getMachineColumnTotal(machineRow, 'weight') → 150.5
     */
    getMachineColumnTotal: function(machineRow, colName) {
      if (!machineRow || !machineRow.columnTotals) return 0;
      var col = machineRow.columnTotals.find(function(c) { return c.columnName === colName; });
      return col ? col.totalValue : 0;
    },

    /**
     * From machineColumnAggregates or columnTotals, find a specific column entry.
     * Example: window.x.findColumn(cols, 'weight') → { columnName, totalValue, count, average, orderCount }
     */
    findColumn: function(cols, colName) {
      if (!cols) return null;
      return cols.find(function(c) { return c.columnName === colName; }) || null;
    },

    /**
     * Summarise column totals across all machines.
     * Useful when you have multiple machines and want grand total weight etc.
     * Example: window.x.sumColumn(machineAggregates, 'weight') → 450.0
     */
    sumColumn: function(machineAggregates, colName) {
      if (!machineAggregates) return 0;
      return machineAggregates.reduce(function(sum, m) {
        return sum + window.x.getMachineColumnTotal(m, colName);
      }, 0);
    },
  };

  console.log('[window.x] Bridge initialized and ready');
})();
`;
}

export async function handleIframeQuery(event: MessageEvent): Promise<void> {
  const msg = event.data;
  if (!msg || msg.__src !== 'wx-iframe') return;

  const source = event.source as Window | null;
  if (!source) return;

  let data:  any         = null;
  let error: string|null = null;

  try {
    const q        = msg.query;
    const branchId = resolveBranchId();

    const dateFilter: Partial<OrderFilter> = {};
    if (q.from) dateFilter.fromDate = q.from;
    if (q.to)   dateFilter.toDate   = q.to;

    if (q.type === 'byId') {
      data = await _fetchOrderById(q.id ?? '');

    } else if (q.type === 'byStatus') {
      data = await _fetchOrdersByStatus(q.status ?? [], {
        branchId,
        ...dateFilter,
      });

    } else if (q.type === 'byPriority') {
      const priorities = Array.isArray(q.priority) ? q.priority : [q.priority];
      const res        = await gqlPost(GQL_GET_ORDERS, {
        filter: {
          branchId,
          priority: priorities,
          ...dateFilter,
        },
      });
      data = unwrapOrders(res);

    } else if (q.type === 'byCustomer') {
      data = await _fetchOrdersByCustomer(q.customerId ?? '', {
        branchId,
        ...dateFilter,
      });

    } else if (q.type === 'byFilter') {
      const res = await gqlPost(GQL_GET_ORDERS, {
        filter:  { branchId, ...(q.filter ?? {}), ...dateFilter },
        sortBy:  q.sortBy  ?? 'createdAt',
        sortDir: q.sortDir ?? 'desc',
      });
      data = unwrapOrders(res);

    } else if (q.type === 'sameDayDispatch') {
      const res = await gqlPost(GQL_GET_ORDERS, {
        filter: {
          branchId,
          sameDayDispatch: true,
          ...dateFilter,
        },
      });
      data = unwrapOrders(res);

    } else if (q.type === 'outputReport') {
      // Input (option spec) vs Output (machine table column) per order
      // Usage: window.x.query({ type:'outputReport', specName:'Weight', columnName:'Output KG', from, to })
      const res = await gqlPost<any>(GQL_OUTPUT_REPORT, {
        overallStatus: q.status      ?? undefined,
        priority:      q.priority    ?? undefined,
        dateFrom:      q.from        ?? undefined,
        dateTo:        q.to          ?? undefined,
        specName:      q.specName    ?? undefined,
        specNames:     q.specNames   ?? undefined,
        columnName:    q.columnName  ?? undefined,
        columnNames:   q.columnNames ?? undefined,
      });
      data = res?.data?.getOrderOutputReport ?? [];

    } else if (q.type === 'outputSummary') {
      // Summary totals: totalInput, totalOutput, totalWastage, efficiency + rows
      // Usage: window.x.query({ type:'outputSummary', specName:'Weight', columnName:'Output KG' })
      const res = await gqlPost<any>(GQL_OUTPUT_SUMMARY, {
        overallStatus: q.status      ?? undefined,
        priority:      q.priority    ?? undefined,
        dateFrom:      q.from        ?? undefined,
        dateTo:        q.to          ?? undefined,
        specName:      q.specName    ?? undefined,
        specNames:     q.specNames   ?? undefined,
        columnName:    q.columnName  ?? undefined,
        columnNames:   q.columnNames ?? undefined,
      });
      data = res?.data?.getOrderOutputSummary ?? {};

    } else if (q.type === 'specAggregates') {
      // Total weight/value of specs across orders
      // Usage: window.x.query({ type: 'specAggregates', specNames: ['W'], customerId: '...', status: ['completed'], from, to })
      const res = await gqlPost<any>(GQL_SPEC_AGGREGATES, {
        status:      q.status      ?? undefined,
        priority:    q.priority    ?? undefined,
        dateFrom:    q.from        ?? undefined,
        dateTo:      q.to          ?? undefined,
        specNames:   q.specNames   ?? undefined,
        customerId:  q.customerId  ?? undefined,
        orderTypeId: q.orderTypeId ?? undefined,
      });
      data = res?.data?.getSpecificationAggregates ?? [];

    } else if (q.type === 'machineAggregates') {
      // Machine production stats across orders — includes columnTotals (total weight, etc.)
      // Usage: window.x.query({ type: 'machineAggregates', machineId, from, to })
      const res = await gqlPost<any>(GQL_MACHINE_AGGREGATES, {
        orderTypeId:   q.orderTypeId   ?? undefined,
        overallStatus: q.status        ?? undefined,
        priority:      q.priority      ?? undefined,
        dateFrom:      q.from          ?? undefined,
        dateTo:        q.to            ?? undefined,
        machineId:     q.machineId     ?? undefined,
        machineIds:    q.machineIds    ?? undefined,
      });
      data = res?.data?.getMachineTableAggregates ?? [];

    } else if (q.type === 'machineColumnAggregates') {
      // Column-level totals per machine — total weight, total length, waste, etc.
      // Usage: window.x.query({ type: 'machineColumnAggregates', machineId, columnNames: ['weight','waste'], from, to })
      const res = await gqlPost<any>(GQL_MACHINE_COLUMN_AGGREGATES, {
        orderTypeId:   q.orderTypeId   ?? undefined,
        overallStatus: q.status        ?? undefined,
        priority:      q.priority      ?? undefined,
        dateFrom:      q.from          ?? undefined,
        dateTo:        q.to            ?? undefined,
        machineId:     q.machineId     ?? undefined,
        machineIds:    q.machineIds    ?? undefined,
        columnName:    q.columnName    ?? undefined,
        columnNames:   q.columnNames   ?? undefined,
      });
      data = res?.data?.getMachineColumnAggregates ?? [];

    } else {
      // type === 'all'
      data = await _fetchAllOrders({
        branchId,
        ...dateFilter,
      });
    }

  } catch (err: any) {
    error = err?.message ?? 'fetch failed';
    console.error('[handleIframeQuery] Query failed:', error, msg.query);
  }

  source.postMessage({ __src: 'wx-parent', id: msg.id, data, error }, '*');
}

export function registerWindowX(): void {
  console.log('[registerWindowX] parent window.x registered');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Redux thunks (FIXED - No Pagination)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchOrders = ({
  filter,
  sortBy = 'createdAt',
  sortDir = 'desc',
}: FetchOrdersParams) =>
  async (dispatch: Dispatch) => {
    if (!filter?.branchId) { 
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: 'filter.branchId is required' }); 
      return; 
    }
    dispatch({ type: GRAPHQL_ORDERS_REQUEST });
    try {
      const result = await gqlPost(GQL_GET_ORDERS, { filter, sortBy, sortDir });
      dispatch({ type: GRAPHQL_ORDERS_SUCCESS, payload: unwrapOrders(result) });
      return result;
    } catch (err: any) {
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: err.message });
      throw err;
    }
  };

export const fetchAllOrders = (branchId: string, extraFilter: Partial<Omit<OrderFilter, 'branchId'>> = {}) =>
  async (dispatch: Dispatch) => {
    if (!branchId) { 
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: 'branchId is required' }); 
      return; 
    }
    dispatch({ type: GRAPHQL_ORDERS_REQUEST });
    try {
      const result = await _fetchAllOrders({ branchId, ...extraFilter });
      dispatch({ type: GRAPHQL_ORDERS_SUCCESS, payload: result });
      return result;
    } catch (err: any) {
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: err.message });
      throw err;
    }
  };

export const fetchOrdersByStatus = (
  branchId: string,
  status: string | string[],
  extra: Partial<Omit<OrderFilter, 'branchId' | 'overallStatus'>> = {}
) =>
  async (dispatch: Dispatch) => {
    if (!branchId) { 
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: 'branchId is required' }); 
      return; 
    }
    dispatch({ type: GRAPHQL_ORDERS_REQUEST });
    try {
      const result = await _fetchOrdersByStatus(status, { branchId, ...extra });
      dispatch({ type: GRAPHQL_ORDERS_SUCCESS, payload: result });
      return result;
    } catch (err: any) {
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: err.message });
      throw err;
    }
  };

export const fetchOrdersByPriority = (
  branchId: string,
  priority: string | string[],
  extra: Partial<Omit<OrderFilter, 'branchId' | 'priority'>> = {}
) =>
  async (dispatch: Dispatch) => {
    if (!branchId) { 
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: 'branchId is required' }); 
      return; 
    }
    dispatch({ type: GRAPHQL_ORDERS_REQUEST });
    try {
      const priorities = Array.isArray(priority) ? priority : [priority];
      const result = await gqlPost(GQL_GET_ORDERS, { 
        filter: { branchId, priority: priorities, ...extra }
      });
      dispatch({ type: GRAPHQL_ORDERS_SUCCESS, payload: unwrapOrders(result) });
      return result;
    } catch (err: any) {
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: err.message });
      throw err;
    }
  };

export const fetchOrdersByDateRange = (
  branchId: string,
  fromDate: string,
  toDate: string,
  extra: Partial<Omit<OrderFilter, 'branchId' | 'fromDate' | 'toDate'>> = {}
) =>
  async (dispatch: Dispatch) => {
    if (!branchId) { 
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: 'branchId is required' }); 
      return; 
    }
    dispatch({ type: GRAPHQL_ORDERS_REQUEST });
    try {
      const result = await gqlPost(GQL_GET_ORDERS, { 
        filter: { branchId, fromDate, toDate, ...extra }
      });
      dispatch({ type: GRAPHQL_ORDERS_SUCCESS, payload: unwrapOrders(result) });
      return result;
    } catch (err: any) {
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: err.message });
      throw err;
    }
  };

export const fetchOrdersByCustomer = (
  branchId: string,
  customerId: string,
  extra: Partial<Omit<OrderFilter, 'branchId' | 'customerId'>> = {}
) =>
  async (dispatch: Dispatch) => {
    if (!branchId || !customerId) { 
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: 'branchId and customerId are required' }); 
      return; 
    }
    dispatch({ type: GRAPHQL_ORDERS_REQUEST });
    try {
      const result = await gqlPost(GQL_GET_ORDERS, { 
        filter: { branchId, customerId, ...extra }
      });
      dispatch({ type: GRAPHQL_ORDERS_SUCCESS, payload: unwrapOrders(result) });
      return result;
    } catch (err: any) {
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: err.message });
      throw err;
    }
  };

export const searchOrders = (
  branchId: string,
  searchTerm: string,
  extra: Partial<Omit<OrderFilter, 'branchId' | 'search'>> = {}
) =>
  async (dispatch: Dispatch) => {
    if (!branchId || !searchTerm) { 
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: 'branchId and searchTerm are required' }); 
      return; 
    }
    dispatch({ type: GRAPHQL_ORDERS_REQUEST });
    try {
      const result = await gqlPost(GQL_GET_ORDERS, { 
        filter: { branchId, search: searchTerm, ...extra }
      });
      dispatch({ type: GRAPHQL_ORDERS_SUCCESS, payload: unwrapOrders(result) });
      return result;
    } catch (err: any) {
      dispatch({ type: GRAPHQL_ORDERS_FAILURE, payload: err.message });
      throw err;
    }
  };

export const fetchOrder = (id: string) =>
  async (dispatch: Dispatch) => {
    if (!id) { 
      dispatch({ type: GRAPHQL_ORDER_FAILURE, payload: 'order id is required' }); 
      return; 
    }
    dispatch({ type: GRAPHQL_ORDER_REQUEST });
    try {
      const order = await _fetchOrderById(id);
      dispatch({ type: GRAPHQL_ORDER_SUCCESS, payload: order });
      return order;
    } catch (err: any) {
      dispatch({ type: GRAPHQL_ORDER_FAILURE, payload: err.message });
      throw err;
    }
  };

export const resetOrders = () => ({ type: GRAPHQL_ORDERS_RESET });