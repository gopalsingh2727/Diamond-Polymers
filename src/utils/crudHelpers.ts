import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
const API_KEY = import.meta.env.VITE_API_KEY || '27infinity.in_5f84c89315f74a2db149c06a93cf4820';

/**
 * Get selected branch from localStorage
 * Checks both 'selectedBranch' key and userData.selectedBranch for compatibility
 */
const getSelectedBranch = (): string | null => {
  // First check direct localStorage key
  const directBranch = localStorage.getItem('selectedBranch');
  if (directBranch) {
    return directBranch;
  }

  // Fallback: check userData.selectedBranch
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.selectedBranch || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

/**
 * Create axios instance with default configuration
 */
const createAPIClient = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add selected branch header for data isolation
  const selectedBranch = getSelectedBranch();
  if (selectedBranch) {
    headers['x-selected-branch'] = selectedBranch;
  }

  return axios.create({
    baseURL: API_BASE_URL,
    headers,
    timeout: 30000
  });
};

/**
 * Generic CRUD API Helper Functions
 */
export const crudAPI = {
  /**
   * Create a new resource
   */
  create: async <T = any>(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const client = createAPIClient(token || undefined);

    try {
      const response = await client.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Read/Get a resource or list of resources
   */
  read: async <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const client = createAPIClient(token || undefined);

    try {
      const response = await client.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Update an existing resource
   */
  update: async <T = any>(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const client = createAPIClient(token || undefined);

    try {
      const response = await client.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Partially update a resource
   */
  patch: async <T = any>(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const client = createAPIClient(token || undefined);

    try {
      const response = await client.patch(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  /**
   * Delete a resource
   */
  delete: async <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const client = createAPIClient(token || undefined);

    try {
      const response = await client.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  }
};

/**
 * Handle API errors consistently
 */
const handleAPIError = (error: any): Error => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || error.message;
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.');
    } else {
      // Error in request setup
      return new Error(error.message);
    }
  }
  return error instanceof Error ? error : new Error('Unknown error occurred');
};

/**
 * Resource-specific CRUD helpers
 */

// Branch CRUD
export const branchAPI = {
  create: (data: any) => crudAPI.create('/branch/branch', data),
  getAll: () => crudAPI.read('/branch/branches'),
  getById: (id: string) => crudAPI.read(`/branch/branch/${id}`),
  update: (id: string, data: any) => crudAPI.update(`/branch/branch/${id}`, data),
  delete: (id: string) => crudAPI.delete(`/branch/branch/${id}`)
};

// Customer CRUD
export const customerAPI = {
  create: (data: any) => crudAPI.create('/customer/customer', data),
  getAll: () => crudAPI.read('/customer/customers'),
  getById: (id: string) => crudAPI.read(`/customer/customer/${id}`),
  update: (id: string, data: any) => crudAPI.update(`/customer/customer/${id}`, data),
  delete: (id: string) => crudAPI.delete(`/customer/customer/${id}`)
};

// Machine CRUD
export const machineAPI = {
  create: (data: any) => crudAPI.create('/machine/machine', data),
  getAll: () => crudAPI.read('/machine/machines'),
  getById: (id: string) => crudAPI.read(`/machine/machine/${id}`),
  update: (id: string, data: any) => crudAPI.update(`/machine/machine/${id}`, data),
  delete: (id: string) => crudAPI.delete(`/machine/machine/${id}`)
};

// Order CRUD
export const orderAPI = {
  create: (data: any) => crudAPI.create('/order/order', data),
  getAll: () => crudAPI.read('/oders/oders'),
  getById: (id: string) => crudAPI.read(`/order/order/${id}`),
  update: (id: string, data: any) => crudAPI.update(`/order/order/${id}`, data),
  delete: (id: string) => crudAPI.delete(`/order/order/${id}`)
};

// Product CRUD
export const productAPI = {
  create: (data: any) => crudAPI.create('/product/product', data),
  getAll: () => crudAPI.read('/product/products'),
  getById: (id: string) => crudAPI.read(`/product/product/${id}`),
  update: (id: string, data: any) => crudAPI.update(`/product/product/${id}`, data),
  delete: (id: string) => crudAPI.delete(`/product/product/${id}`)
};

// Material CRUD
export const materialAPI = {
  create: (data: any) => crudAPI.create('/material/material', data),
  getAll: () => crudAPI.read('/material/materials'),
  getById: (id: string) => crudAPI.read(`/material/material/${id}`),
  update: (id: string, data: any) => crudAPI.update(`/material/material/${id}`, data),
  delete: (id: string) => crudAPI.delete(`/material/material/${id}`)
};

// External API Key CRUD (Master Admin only)
export const externalAPIKeyAPI = {
  create: (data: any) => crudAPI.create('/external-api-keys', data),
  getAll: () => crudAPI.read('/external-api-keys'),
  getById: (id: string) => crudAPI.read(`/external-api-keys/${id}`),
  update: (id: string, data: any) => crudAPI.update(`/external-api-keys/${id}`, data),
  delete: (id: string) => crudAPI.delete(`/external-api-keys/${id}`),
  regenerateSecret: (id: string) => crudAPI.create(`/external-api-keys/${id}/regenerate-secret`, {}),
  getUsage: (id: string) => crudAPI.read(`/external-api-keys/${id}/usage`)
};

// Branch Settings CRUD (Master Admin only)
export const branchSettingsAPI = {
  getAll: () => crudAPI.read('/branch-settings'),
  getByBranch: (branchId: string) => crudAPI.read(`/branch-settings/${branchId}`),
  update: (branchId: string, data: any) => crudAPI.update(`/branch-settings/${branchId}`, data),
  testEmail: (branchId: string, email: string) => crudAPI.create(`/branch-settings/${branchId}/test-email`, { email }),
  testWhatsApp: (branchId: string, phone: string) => crudAPI.create(`/branch-settings/${branchId}/test-whatsapp`, { phone })
};

/**
 * Example Usage:
 *
 * import { branchAPI } from '@/utils/crudHelpers';
 * import { useCRUD } from '@/hooks/useCRUD';
 *
 * const MyComponent = () => {
 *   const { handleSave } = useCRUD();
 *
 *   const saveBranch = () => {
 *     handleSave(() => branchAPI.create(branchData), {
 *       successMessage: 'Branch created successfully'
 *     });
 *   };
 * };
 */
