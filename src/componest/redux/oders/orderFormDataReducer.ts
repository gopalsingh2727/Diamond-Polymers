import {
  GET_ORDER_FORM_DATA_REQUEST,
  GET_ORDER_FORM_DATA_SUCCESS,
  GET_ORDER_FORM_DATA_FAIL } from
"./orderFormDataActions";

interface OrderFormData {
  customers: any[];
  productTypes: any[];
  products: any[];
  productSpecs: any[];
  materialTypes: any[];
  materials: any[];
  materialSpecs: any[];
  machineTypes: any[];
  machines: any[];
  operators: any[];
  steps: any[];
  orderTypes: any[];
  // Options System
  categories: any[];
  optionTypes: any[];
  options: any[];
  optionSpecs: any[];
}

interface OrderFormDataState {
  loading: boolean;
  error: string | null;
  data: OrderFormData | null;
  lastFetched: string | null;
}

// LocalStorage key - CACHE_VERSION is incremented when API response format changes
const CACHE_VERSION = 3; // v3: Branch-specific caching
const getLocalStorageKey = () => {
  const branchId = localStorage.getItem("selectedBranch") || "default";
  return `order_form_data_cache_v${CACHE_VERSION}_${branchId}`;
};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Clean up old cache versions on load (keep only current version caches)
(() => {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      // Remove caches from older versions (v1, v2, etc.)
      if (key && key.startsWith('order_form_data_cache') && !key.includes(`_v${CACHE_VERSION}_`)) {

        localStorage.removeItem(key);
      }
    }
  } catch (error) {

  }
})();

// Load from localStorage
const loadFromLocalStorage = (): OrderFormDataState => {
  try {
    const storageKey = getLocalStorageKey();
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached);

      // Check if cache is still valid (within 24 hours)
      const lastFetched = new Date(parsed.lastFetched).getTime();
      const now = Date.now();

      if (now - lastFetched < CACHE_DURATION) {

        return {
          loading: false,
          error: null,
          data: parsed.data,
          lastFetched: parsed.lastFetched
        };
      } else {

        localStorage.removeItem(storageKey);
      }
    }
  } catch (error) {

  }

  return {
    loading: false,
    error: null,
    data: null,
    lastFetched: null
  };
};

// Save to localStorage
const saveToLocalStorage = (data: OrderFormData, lastFetched: string) => {
  try {
    const storageKey = getLocalStorageKey();
    localStorage.setItem(storageKey, JSON.stringify({
      data,
      lastFetched
    }));

  } catch (error) {

  }
};

// ⚠️ CRITICAL FIX: Don't load from localStorage at module load time
// This causes stale data to persist when CLEAR_BRANCH_DATA resets state to undefined
// Instead, always start with empty state and let components trigger fresh fetches
const initialState: OrderFormDataState = {
  loading: false,
  error: null,
  data: null,
  lastFetched: null
};

export const orderFormDataReducer = (
state = initialState,
action: any)
: OrderFormDataState => {
  switch (action.type) {
    // ✅ NEW: Try to load from localStorage for current branch on first request
    case GET_ORDER_FORM_DATA_REQUEST: {
      // If we don't have data yet, try loading from localStorage first
      if (!state.data) {
        const cached = loadFromLocalStorage();
        // If cache exists and is valid, use it but still set loading: true for fresh fetch
        if (cached.data) {
          return { ...cached, loading: true };
        }
      }
      return { ...state, loading: true, error: null };
    }

    case GET_ORDER_FORM_DATA_SUCCESS:
      const timestamp = new Date().toISOString();
      // Save to localStorage
      saveToLocalStorage(action.payload, timestamp);

      return {
        loading: false,
        data: action.payload,
        error: null,
        lastFetched: timestamp
      };

    case GET_ORDER_FORM_DATA_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'CLEAR_ORDER_FORM_DATA':
      // Clear all branch caches on logout
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('order_form_data_cache')) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {

      }
      return {
        loading: false,
        error: null,
        data: null,
        lastFetched: null
      };

    // ✅ NEW: Clear cache when branch switches
    case 'CLEAR_BRANCH_DATA':
      // Clear current branch's cache to prevent showing stale options data
      try {
        const storageKey = getLocalStorageKey();
        localStorage.removeItem(storageKey);

      } catch (e) {

      }
      return {
        loading: false,
        error: null,
        data: null,
        lastFetched: null
      };

    case 'REFRESH_ORDER_FORM_DATA':
      // ✅ CRITICAL FIX: Clear current branch cache and reset to empty state
      // This ensures old data doesn't persist when branch switches
      try {
        const storageKey = getLocalStorageKey();
        localStorage.removeItem(storageKey);

      } catch (e) {

      }
      // Return empty state - next GET_ORDER_FORM_DATA_REQUEST will fetch fresh
      return {
        loading: false,
        error: null,
        data: null,
        lastFetched: null
      };

    default:
      return state;
  }
};

export default orderFormDataReducer;