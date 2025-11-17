import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { crudAPI } from '../../../utils/crudHelpers';

interface CacheEntry {
  data: any;
  timestamp: number;
  error: string | null;
}

interface CacheState {
  branches: CacheEntry;
  customers: CacheEntry;
  machines: CacheEntry;
  products: CacheEntry;
  materials: CacheEntry;
  materialTypes: CacheEntry;
  productTypes: CacheEntry;
  machineTypes: CacheEntry;
  loading: {
    branches: boolean;
    customers: boolean;
    machines: boolean;
    products: boolean;
    materials: boolean;
    materialTypes: boolean;
    productTypes: boolean;
    machineTypes: boolean;
  };
}

const initialCacheEntry: CacheEntry = {
  data: null,
  timestamp: 0,
  error: null
};

const initialState: CacheState = {
  branches: initialCacheEntry,
  customers: initialCacheEntry,
  machines: initialCacheEntry,
  products: initialCacheEntry,
  materials: initialCacheEntry,
  materialTypes: initialCacheEntry,
  productTypes: initialCacheEntry,
  machineTypes: initialCacheEntry,
  loading: {
    branches: false,
    customers: false,
    machines: false,
    products: false,
    materials: false,
    materialTypes: false,
    productTypes: false,
    machineTypes: false
  }
};

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

// Helper to check if cache is valid
const isCacheValid = (entry: CacheEntry): boolean => {
  if (!entry.data || entry.timestamp === 0) return false;
  const age = Date.now() - entry.timestamp;
  return age < CACHE_TTL;
};

// Async thunks with caching logic
export const fetchBranches = createAsyncThunk(
  'cache/fetchBranches',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as { cache: CacheState };

    // Return cached data if valid and not forced
    if (!force && isCacheValid(state.cache.branches)) {
      console.log('[Redux Cache] Using cached branches');
      return state.cache.branches.data;
    }

    try {
      console.log('[Redux Cache] Fetching fresh branches...');
      const response = await crudAPI.read('/branch/branches');
      return response.branches || response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  'cache/fetchCustomers',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as { cache: CacheState };

    if (!force && isCacheValid(state.cache.customers)) {
      console.log('[Redux Cache] Using cached customers');
      return state.cache.customers.data;
    }

    try {
      console.log('[Redux Cache] Fetching fresh customers...');
      const response = await crudAPI.read('/customer/customers');
      return response.customers || response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMachines = createAsyncThunk(
  'cache/fetchMachines',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as { cache: CacheState };

    if (!force && isCacheValid(state.cache.machines)) {
      console.log('[Redux Cache] Using cached machines');
      return state.cache.machines.data;
    }

    try {
      console.log('[Redux Cache] Fetching fresh machines...');
      const response = await crudAPI.read('/machine/machines');
      return response.machines || response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'cache/fetchProducts',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as { cache: CacheState };

    if (!force && isCacheValid(state.cache.products)) {
      console.log('[Redux Cache] Using cached products');
      return state.cache.products.data;
    }

    try {
      console.log('[Redux Cache] Fetching fresh products...');
      const response = await crudAPI.read('/product/products');
      return response.products || response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMaterials = createAsyncThunk(
  'cache/fetchMaterials',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as { cache: CacheState };

    if (!force && isCacheValid(state.cache.materials)) {
      console.log('[Redux Cache] Using cached materials');
      return state.cache.materials.data;
    }

    try {
      console.log('[Redux Cache] Fetching fresh materials...');
      const response = await crudAPI.read('/material/materials');
      return response.materials || response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMaterialTypes = createAsyncThunk(
  'cache/fetchMaterialTypes',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as { cache: CacheState };

    if (!force && isCacheValid(state.cache.materialTypes)) {
      console.log('[Redux Cache] Using cached material types');
      return state.cache.materialTypes.data;
    }

    try {
      console.log('[Redux Cache] Fetching fresh material types...');
      const response = await crudAPI.read('/materialType/materialTypes');
      return response.materialTypes || response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductTypes = createAsyncThunk(
  'cache/fetchProductTypes',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as { cache: CacheState };

    if (!force && isCacheValid(state.cache.productTypes)) {
      console.log('[Redux Cache] Using cached product types');
      return state.cache.productTypes.data;
    }

    try {
      console.log('[Redux Cache] Fetching fresh product types...');
      const response = await crudAPI.read('/productType/productTypes');
      return response.productTypes || response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMachineTypes = createAsyncThunk(
  'cache/fetchMachineTypes',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as { cache: CacheState };

    if (!force && isCacheValid(state.cache.machineTypes)) {
      console.log('[Redux Cache] Using cached machine types');
      return state.cache.machineTypes.data;
    }

    try {
      console.log('[Redux Cache] Fetching fresh machine types...');
      const response = await crudAPI.read('/machineType/machineTypes');
      return response.machineTypes || response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all data at once
export const fetchAllCachedData = createAsyncThunk(
  'cache/fetchAll',
  async (force: boolean = false, { dispatch }) => {
    console.log('[Redux Cache] Fetching all cached data...');

    await Promise.all([
      dispatch(fetchBranches(force)),
      dispatch(fetchCustomers(force)),
      dispatch(fetchMachines(force)),
      dispatch(fetchProducts(force)),
      dispatch(fetchMaterials(force)),
      dispatch(fetchMaterialTypes(force)),
      dispatch(fetchProductTypes(force)),
      dispatch(fetchMachineTypes(force))
    ]);

    console.log('[Redux Cache] All data fetched');
  }
);

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    clearCache: (state) => {
      state.branches = initialCacheEntry;
      state.customers = initialCacheEntry;
      state.machines = initialCacheEntry;
      state.products = initialCacheEntry;
      state.materials = initialCacheEntry;
      state.materialTypes = initialCacheEntry;
      state.productTypes = initialCacheEntry;
      state.machineTypes = initialCacheEntry;
      console.log('[Redux Cache] Cache cleared');
    },
    clearCacheItem: (state, action: PayloadAction<keyof Omit<CacheState, 'loading'>>) => {
      const key = action.payload;
      state[key] = initialCacheEntry;
      console.log(`[Redux Cache] Cleared ${key}`);
    }
  },
  extraReducers: (builder) => {
    // Branches
    builder.addCase(fetchBranches.pending, (state) => {
      state.loading.branches = true;
    });
    builder.addCase(fetchBranches.fulfilled, (state, action) => {
      state.branches = {
        data: action.payload,
        timestamp: Date.now(),
        error: null
      };
      state.loading.branches = false;
    });
    builder.addCase(fetchBranches.rejected, (state, action) => {
      state.branches.error = action.payload as string;
      state.loading.branches = false;
    });

    // Customers
    builder.addCase(fetchCustomers.pending, (state) => {
      state.loading.customers = true;
    });
    builder.addCase(fetchCustomers.fulfilled, (state, action) => {
      state.customers = {
        data: action.payload,
        timestamp: Date.now(),
        error: null
      };
      state.loading.customers = false;
    });
    builder.addCase(fetchCustomers.rejected, (state, action) => {
      state.customers.error = action.payload as string;
      state.loading.customers = false;
    });

    // Machines
    builder.addCase(fetchMachines.pending, (state) => {
      state.loading.machines = true;
    });
    builder.addCase(fetchMachines.fulfilled, (state, action) => {
      state.machines = {
        data: action.payload,
        timestamp: Date.now(),
        error: null
      };
      state.loading.machines = false;
    });
    builder.addCase(fetchMachines.rejected, (state, action) => {
      state.machines.error = action.payload as string;
      state.loading.machines = false;
    });

    // Products
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading.products = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.products = {
        data: action.payload,
        timestamp: Date.now(),
        error: null
      };
      state.loading.products = false;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.products.error = action.payload as string;
      state.loading.products = false;
    });

    // Materials
    builder.addCase(fetchMaterials.pending, (state) => {
      state.loading.materials = true;
    });
    builder.addCase(fetchMaterials.fulfilled, (state, action) => {
      state.materials = {
        data: action.payload,
        timestamp: Date.now(),
        error: null
      };
      state.loading.materials = false;
    });
    builder.addCase(fetchMaterials.rejected, (state, action) => {
      state.materials.error = action.payload as string;
      state.loading.materials = false;
    });

    // Material Types
    builder.addCase(fetchMaterialTypes.pending, (state) => {
      state.loading.materialTypes = true;
    });
    builder.addCase(fetchMaterialTypes.fulfilled, (state, action) => {
      state.materialTypes = {
        data: action.payload,
        timestamp: Date.now(),
        error: null
      };
      state.loading.materialTypes = false;
    });
    builder.addCase(fetchMaterialTypes.rejected, (state, action) => {
      state.materialTypes.error = action.payload as string;
      state.loading.materialTypes = false;
    });

    // Product Types
    builder.addCase(fetchProductTypes.pending, (state) => {
      state.loading.productTypes = true;
    });
    builder.addCase(fetchProductTypes.fulfilled, (state, action) => {
      state.productTypes = {
        data: action.payload,
        timestamp: Date.now(),
        error: null
      };
      state.loading.productTypes = false;
    });
    builder.addCase(fetchProductTypes.rejected, (state, action) => {
      state.productTypes.error = action.payload as string;
      state.loading.productTypes = false;
    });

    // Machine Types
    builder.addCase(fetchMachineTypes.pending, (state) => {
      state.loading.machineTypes = true;
    });
    builder.addCase(fetchMachineTypes.fulfilled, (state, action) => {
      state.machineTypes = {
        data: action.payload,
        timestamp: Date.now(),
        error: null
      };
      state.loading.machineTypes = false;
    });
    builder.addCase(fetchMachineTypes.rejected, (state, action) => {
      state.machineTypes.error = action.payload as string;
      state.loading.machineTypes = false;
    });
  }
});

export const { clearCache, clearCacheItem } = cacheSlice.actions;
export default cacheSlice.reducer;
