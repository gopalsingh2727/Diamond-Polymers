import { useEffect, useCallback, useRef } from 'react';
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
  const orderFormDataState = useSelector((state: RootState) => state.orderFormData);
  const formData = orderFormDataState?.data;
  const loading = orderFormDataState?.loading || false;
  const error = orderFormDataState?.error;

  const isAuthenticated = useSelector(
    (state: RootState) => !!(state.auth?.token || localStorage.getItem('authToken'))
  );
  // ⚠️ CRITICAL: Listen to selectedBranch to detect branch changes
  const selectedBranch = useSelector(
    (state: RootState) => state.auth?.userData?.selectedBranch
  );

  // ✅ FIX: Track previous branch to detect changes
  const prevBranchRef = useRef(selectedBranch);

  // Auto-fetch if data is null and user is authenticated (but NOT if there's an error)
  // ✅ CRITICAL FIX: Also re-fetch when selectedBranch changes
  useEffect(() => {
    const branchChanged = prevBranchRef.current !== selectedBranch;

    if (isAuthenticated && !loading) {
      // Fetch if: no data OR branch changed OR error
      if (!formData || branchChanged || error) {
        if (import.meta.env.DEV) {
          console.log('🔄 useFormDataCache: Fetching data for branch:', selectedBranch);
          if (branchChanged) {
            console.log('   Branch changed from', prevBranchRef.current, 'to', selectedBranch);
          }
        }
        dispatch(getOrderFormData() as any);
        prevBranchRef.current = selectedBranch;
      }
    }
  }, [formData, loading, error, isAuthenticated, selectedBranch, dispatch]);

  // ✅ WebSocket listener: Auto-refresh when reference data is invalidated
  useEffect(() => {
    const handleWebSocketMessage = (event: CustomEvent) => {
      const { type, data: eventData } = event.detail;

      if (type === 'referenceData:invalidate') {
        const entityType = eventData?.entity || eventData?.entityType;

        // List of entity types that should trigger a refresh of form data cache
        const refreshTriggers = [
          'orderType',      // Order types with dynamic calculations
          'category',       // Product/service categories
          'optionType',     // Option types
          'option',         // Options
          'optionSpec',     // Option specifications
          'customer',       // Customers
          'machine',        // Machines
          'machineType',    // Machine types
          'operator',       // Operators
          'step'            // Manufacturing steps
        ];

        // Refetch form data when any relevant entity is updated
        if (refreshTriggers.includes(entityType)) {
          if (import.meta.env.DEV) {
            console.log(`🔄 useFormDataCache: WebSocket refresh triggered by ${entityType} update`);
          }
          dispatch(getOrderFormData() as any);
        }
      }
    };

    // Add event listener for WebSocket messages
    window.addEventListener('websocket:message', handleWebSocketMessage as EventListener);

    return () => {
      window.removeEventListener('websocket:message', handleWebSocketMessage as EventListener);
    };
  }, [dispatch]);

  // Manual refresh function
  const refresh = useCallback(() => {

    dispatch(getOrderFormData() as any);
  }, [dispatch]);

  // ⚠️ CRITICAL FIX: Check if data matches current branch
  // If data is from a different branch, return empty arrays to prevent showing stale data
  const isDataValid = useCallback(() => {
    if (!formData || !selectedBranch) return false;

    // Check if any customer has wrong branchId
    if (formData.customers && formData.customers.length > 0) {
      const firstCustomer = formData.customers[0];
      const customerBranch = firstCustomer?.branchId?._id || firstCustomer?.branchId;

      // If customer belongs to different branch, data is invalid
      if (customerBranch && customerBranch !== selectedBranch) {
        if (import.meta.env.DEV) {
          console.log('⚠️ useFormDataCache: Data is from wrong branch!');
          console.log('   Current branch:', selectedBranch);
          console.log('   Data branch:', customerBranch);
        }
        return false;
      }
    }

    return true;
  }, [formData, selectedBranch]);

  // Only return data if it's valid for current branch
  const validData = isDataValid() ? formData : null;

  // DEBUG: Log options system data
  if (import.meta.env.DEV && validData) {
    console.log('📊 useFormDataCache - Options System Data:');
    console.log('   Categories:', validData?.categories?.length || 0);
    console.log('   OptionTypes:', validData?.optionTypes?.length || 0);
    console.log('   Options:', validData?.options?.length || 0);
    console.log('   Customers:', validData?.customers?.length || 0);
  }

  return {
    // All cached data - only if valid for current branch
    customers: validData?.customers || [],
    productTypes: validData?.productTypes || [],
    products: validData?.products || [],
    productSpecs: validData?.productSpecs || [],
    materialTypes: validData?.materialTypes || [],
    materials: validData?.materials || [],
    materialSpecs: validData?.materialSpecs || [],
    machineTypes: validData?.machineTypes || [],
    machines: validData?.machines || [],
    operators: validData?.operators || [],
    steps: validData?.steps || [],
    orderTypes: validData?.orderTypes || [],

    // Options System data
    categories: validData?.categories || [],
    optionTypes: validData?.optionTypes || [],
    options: validData?.options || [],
    optionSpecs: validData?.optionSpecs || [],

    // Loading states
    loading,
    error,

    // Helper to check if data is ready
    isReady: !loading && !!validData,

    // Manual refresh function
    refresh
  };
};

export default useFormDataCache;