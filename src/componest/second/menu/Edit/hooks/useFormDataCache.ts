import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';

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
 *
 * Usage:
 * ```typescript
 * const { productTypes, products, loading } = useFormDataCache();
 * ```
 */
export const useFormDataCache = () => {
  const { data: formData, loading, error } = useSelector(
    (state: RootState) => state.orderFormData || {}
  );

  return {
    // All cached data
    customers: formData?.customers || [],
    productTypes: formData?.productTypes || [],
    products: formData?.products || [],
    productSpecs: formData?.productSpecs || [],
    materialTypes: formData?.materialTypes || [],
    materials: formData?.materials || [],
    machineTypes: formData?.machineTypes || [],
    machines: formData?.machines || [],
    operators: formData?.operators || [],
    steps: formData?.steps || [],
    orderTypes: formData?.orderTypes || [],

    // Loading states
    loading,
    error,

    // Helper to check if data is ready
    isReady: !loading && !!formData,
  };
};

export default useFormDataCache;
