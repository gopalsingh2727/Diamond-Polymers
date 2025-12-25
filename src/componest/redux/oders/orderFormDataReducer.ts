import {
  GET_ORDER_FORM_DATA_REQUEST,
  GET_ORDER_FORM_DATA_SUCCESS,
  GET_ORDER_FORM_DATA_FAIL,
} from "./orderFormDataActions";

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
        console.log('🗑️ Removing old order form data cache:', key);
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old caches:', error);
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
        console.log('✅ Loaded order form data from localStorage cache for branch:', localStorage.getItem("selectedBranch"));
        return {
          loading: false,
          error: null,
          data: parsed.data,
          lastFetched: parsed.lastFetched
        };
      } else {
        console.log('⚠️ Cache expired, will fetch fresh data');
        localStorage.removeItem(storageKey);
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
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
    console.log('✅ Saved order form data to localStorage cache for branch:', localStorage.getItem("selectedBranch"));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const initialState: OrderFormDataState = loadFromLocalStorage();

export const orderFormDataReducer = (
  state = initialState,
  action: any
): OrderFormDataState => {
  switch (action.type) {
    case GET_ORDER_FORM_DATA_REQUEST:
      return { ...state, loading: true, error: null };

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
        console.error('Error clearing order form data caches:', e);
      }
      return {
        loading: false,
        error: null,
        data: null,
        lastFetched: null
      };

    case 'REFRESH_ORDER_FORM_DATA':
      // Force refresh - clear current branch cache and set loading
      try {
        const storageKey = getLocalStorageKey();
        localStorage.removeItem(storageKey);
        console.log('🔄 Cleared cache for branch refresh:', localStorage.getItem("selectedBranch"));
      } catch (e) {
        console.error('Error clearing cache for refresh:', e);
      }
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
