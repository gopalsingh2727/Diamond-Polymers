import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { getOrderFormData } from '../../../../redux/oders/orderFormDataActions';

/**
 * 🚀 OPTIMIZED HOOK: Use cached form data instead of making API calls
 *
 * This hook provides access to all cached form data that's loaded once
 * via the /order/form-data endpoint and cached for 24 hours.
 *
 * Benefits:
 * - Zero API calls after initial load
 * - Instant data access
 * - Works offline (within 24hr cache)
 * - Reduced server load
 * - Auto-refetch when WebSocket invalidates cache
 *
 * Usage:
 * ```typescript
 * const { productTypes, products, loading, refresh } = useFormDataCache();
 * ```
 */
export const useFormDataCache = () => {
  const dispatch = useDispatch();
  const { data: formData, loading, error } = useSelector(
    (state: RootState) => state.orderFormData || {}
  );
  const isAuthenticated = useSelector(
    (state: RootState) => !!(state.auth?.token || localStorage.getItem('authToken'))
  );

  // Auto-fetch if data is null and user is authenticated
  useEffect(() => {
    if (!formData && !loading && isAuthenticated) {
      console.log('🔄 FormDataCache: Data is null, triggering auto-fetch...');
      dispatch(getOrderFormData() as any);
    }
  }, [formData, loading, isAuthenticated, dispatch]);

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log('🔄 FormDataCache: Manual refresh triggered');
    dispatch(getOrderFormData() as any);
  }, [dispatch]);

  return {
    // All cached data
    customers: formData?.customers || [],
    productTypes: formData?.productTypes || [],
    products: formData?.products || [],
    productSpecs: formData?.productSpecs || [],
    materialTypes: formData?.materialTypes || [],
    materials: formData?.materials || [],
    materialSpecs: formData?.materialSpecs || [],
    machineTypes: formData?.machineTypes || [],
    machines: formData?.machines || [],
    operators: formData?.operators || [],
    steps: formData?.steps || [],
    orderTypes: formData?.orderTypes || [],

    // Options System data
    categories: formData?.categories || [],
    optionTypes: formData?.optionTypes || [],
    options: formData?.options || [],
    optionSpecs: formData?.optionSpecs || [],

    // Loading states
    loading,
    error,

    // Helper to check if data is ready
    isReady: !loading && !!formData,

    // Manual refresh function
    refresh,
  };
};

export default useFormDataCache;
