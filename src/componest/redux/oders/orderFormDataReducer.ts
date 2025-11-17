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
  machineTypes: any[];
  machines: any[];
  operators: any[];
  steps: any[];
}

interface OrderFormDataState {
  loading: boolean;
  error: string | null;
  data: OrderFormData | null;
  lastFetched: string | null;
}

// LocalStorage key
const LOCAL_STORAGE_KEY = 'order_form_data_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Load from localStorage
const loadFromLocalStorage = (): OrderFormDataState => {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);

      // Check if cache is still valid (within 24 hours)
      const lastFetched = new Date(parsed.lastFetched).getTime();
      const now = Date.now();

      if (now - lastFetched < CACHE_DURATION) {
        console.log('✅ Loaded order form data from localStorage cache');
        return {
          loading: false,
          error: null,
          data: parsed.data,
          lastFetched: parsed.lastFetched
        };
      } else {
        console.log('⚠️ Cache expired, will fetch fresh data');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
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
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      data,
      lastFetched
    }));
    console.log('✅ Saved order form data to localStorage cache');
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
      // Clear localStorage on logout
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return {
        loading: false,
        error: null,
        data: null,
        lastFetched: null
      };

    case 'REFRESH_ORDER_FORM_DATA':
      // Force refresh - clear cache and set loading
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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
