import { useMemo } from 'react';
import { useDataCache } from './useDataCache';
import { crudAPI } from '../utils/crudHelpers';

/**
 * Helper to safely extract array from API response
 * Handles different response formats:
 * - { branches: [...] }
 * - { data: { branches: [...] } }
 * - [...]
 */
const extractArray = (data: any, key: string): any[] => {
  if (!data) {
    console.warn(`[useOrderFormData] No data for ${key}`);
    return [];
  }

  // If data is already an array
  if (Array.isArray(data)) {
    console.log(`[useOrderFormData] ${key}: Array format`, data.length, 'items');
    return data;
  }

  // If data has the key directly (e.g., { branches: [...] })
  if (data[key] && Array.isArray(data[key])) {
    console.log(`[useOrderFormData] ${key}: Object with key format`, data[key].length, 'items');
    return data[key];
  }

  // If data has nested structure (e.g., { data: { branches: [...] } })
  if (data.data && data.data[key] && Array.isArray(data.data[key])) {
    console.log(`[useOrderFormData] ${key}: Nested data format`, data.data[key].length, 'items');
    return data.data[key];
  }

  // If data.data is an array
  if (data.data && Array.isArray(data.data)) {
    console.log(`[useOrderFormData] ${key}: data as array format`, data.data.length, 'items');
    return data.data;
  }

  console.warn(`[useOrderFormData] ${key}: Unknown format, returning empty array. Data:`, data);
  return [];
};

/**
 * Hook to manage all data needed for Order Create/Edit forms
 * Caches data to prevent multiple API calls
 *
 * Usage:
 * const { branches, customers, machines, products, materials, isLoading, refresh } = useOrderFormData();
 */
export const useOrderFormData = () => {
  // Cache branches (5 min TTL)
  const {
    data: branchesData,
    isLoading: branchesLoading,
    refresh: refreshBranches,
    error: branchesError
  } = useDataCache('branches', () => crudAPI.read('/branch/branches'), {
    ttl: 5 * 60 * 1000
  });

  // Cache customers (5 min TTL)
  const {
    data: customersData,
    isLoading: customersLoading,
    refresh: refreshCustomers,
    error: customersError
  } = useDataCache('customers', () => crudAPI.read('/customer/customers'), {
    ttl: 5 * 60 * 1000
  });

  // Cache machines (5 min TTL)
  const {
    data: machinesData,
    isLoading: machinesLoading,
    refresh: refreshMachines,
    error: machinesError
  } = useDataCache('machines', () => crudAPI.read('/machine/machines'), {
    ttl: 5 * 60 * 1000
  });

  // Cache products (5 min TTL)
  const {
    data: productsData,
    isLoading: productsLoading,
    refresh: refreshProducts,
    error: productsError
  } = useDataCache('products', () => crudAPI.read('/product/products'), {
    ttl: 5 * 60 * 1000
  });

  // Cache materials (5 min TTL)
  const {
    data: materialsData,
    isLoading: materialsLoading,
    refresh: refreshMaterials,
    error: materialsError
  } = useDataCache('materials', () => crudAPI.read('/material/materials'), {
    ttl: 5 * 60 * 1000
  });

  // Cache material types (10 min TTL - less frequent changes)
  const {
    data: materialTypesData,
    isLoading: materialTypesLoading,
    refresh: refreshMaterialTypes
  } = useDataCache('materialTypes', () => crudAPI.read('/materialType/materialTypes'), {
    ttl: 10 * 60 * 1000
  });

  // Cache product types (10 min TTL)
  const {
    data: productTypesData,
    isLoading: productTypesLoading,
    refresh: refreshProductTypes
  } = useDataCache('productTypes', () => crudAPI.read('/productType/productTypes'), {
    ttl: 10 * 60 * 1000
  });

  // Cache machine types (10 min TTL)
  const {
    data: machineTypesData,
    isLoading: machineTypesLoading,
    refresh: refreshMachineTypes
  } = useDataCache('machineTypes', () => crudAPI.read('/machineType/machineTypes'), {
    ttl: 10 * 60 * 1000
  });

  // Extract arrays from responses
  const branches = useMemo(() => extractArray(branchesData, 'branches'), [branchesData]);
  const customers = useMemo(() => extractArray(customersData, 'customers'), [customersData]);
  const machines = useMemo(() => extractArray(machinesData, 'machines'), [machinesData]);
  const products = useMemo(() => extractArray(productsData, 'products'), [productsData]);
  const materials = useMemo(() => extractArray(materialsData, 'materials'), [materialsData]);
  const materialTypes = useMemo(() => extractArray(materialTypesData, 'materialTypes'), [materialTypesData]);
  const productTypes = useMemo(() => extractArray(productTypesData, 'productTypes'), [productTypesData]);
  const machineTypes = useMemo(() => extractArray(machineTypesData, 'machineTypes'), [machineTypesData]);

  // Combined loading state
  const isLoading = useMemo(() => {
    return branchesLoading ||
      customersLoading ||
      machinesLoading ||
      productsLoading ||
      materialsLoading ||
      materialTypesLoading ||
      productTypesLoading ||
      machineTypesLoading;
  }, [
    branchesLoading,
    customersLoading,
    machinesLoading,
    productsLoading,
    materialsLoading,
    materialTypesLoading,
    productTypesLoading,
    machineTypesLoading
  ]);

  // Refresh all data
  const refreshAll = () => {
    console.log('[OrderFormData] Refreshing all cached data...');
    refreshBranches();
    refreshCustomers();
    refreshMachines();
    refreshProducts();
    refreshMaterials();
    refreshMaterialTypes();
    refreshProductTypes();
    refreshMachineTypes();
  };

  // Check if all data is loaded
  const isReady = useMemo(() => {
    return !isLoading &&
      branchesData !== null &&
      customersData !== null &&
      machinesData !== null &&
      productsData !== null &&
      materialsData !== null;
  }, [isLoading, branchesData, customersData, machinesData, productsData, materialsData]);

  // Log errors
  if (branchesError) console.error('[OrderFormData] Branches error:', branchesError);
  if (customersError) console.error('[OrderFormData] Customers error:', customersError);
  if (machinesError) console.error('[OrderFormData] Machines error:', machinesError);
  if (productsError) console.error('[OrderFormData] Products error:', productsError);
  if (materialsError) console.error('[OrderFormData] Materials error:', materialsError);

  return {
    // Data (guaranteed to be arrays)
    branches,
    customers,
    machines,
    products,
    materials,
    materialTypes,
    productTypes,
    machineTypes,

    // Raw data (for debugging)
    _raw: {
      branchesData,
      customersData,
      machinesData,
      productsData,
      materialsData
    },

    // Status
    isLoading,
    isReady,

    // Errors
    errors: {
      branches: branchesError,
      customers: customersError,
      machines: machinesError,
      products: productsError,
      materials: materialsError
    },

    // Actions
    refresh: refreshAll,
    refreshBranches,
    refreshCustomers,
    refreshMachines,
    refreshProducts,
    refreshMaterials,
    refreshMaterialTypes,
    refreshProductTypes,
    refreshMachineTypes
  };
};
