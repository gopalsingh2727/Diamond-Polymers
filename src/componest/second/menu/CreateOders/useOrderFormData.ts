import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
// ⚠️ TEMPORARILY using old actions until V2 backend issue is fixed
import { getOrderFormDataIfNeeded, refreshOrderFormData } from "../../../redux/oders/orderFormDataActions";
import { RootState } from "../../../redux/rootReducer";

// Stable empty array reference to prevent re-renders
const EMPTY_ARRAY: any[] = [];

/**
 * Custom hook to manage order form data
 * Fetches ALL data in ONE API call on mount (uses cache if available)
 * Provides filtered data based on selections
 * Listens for WebSocket updates to refetch data in real-time
 */
export const useOrderFormData = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.orderFormData || {}
  );

  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>("");

  // ⚠️ TEMPORARILY using old endpoint until V2 backend issue is fixed
  useEffect(() => {
    dispatch(getOrderFormDataIfNeeded() as any);
  }, [dispatch]);

  // Listen for WebSocket updates to refetch order form data in real-time
  useEffect(() => {
    const handleWebSocketMessage = (event: CustomEvent) => {
      const { type, data: eventData } = event.detail;

      if (type === 'referenceData:invalidate') {
        const entityType = eventData?.entity || eventData?.entityType;

        // List of entity types that should trigger a refresh of order form data
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

        // ⚠️ TEMPORARILY using old action until V2 backend issue is fixed
        if (refreshTriggers.includes(entityType)) {
          console.log(`🔄 WebSocket: Refreshing order form data due to ${entityType} update`);
          dispatch(refreshOrderFormData() as any);
        }
      }
    };

    // Add event listener for WebSocket messages
    window.addEventListener('websocket:message', handleWebSocketMessage as EventListener);

    return () => {
      window.removeEventListener('websocket:message', handleWebSocketMessage as EventListener);
    };
  }, [dispatch]);

  // Memoize filtered products by selected product type
  const filteredProducts = useMemo(() => {
    if (selectedProductType && data?.products) {
      return data.products.filter(
        (product: any) => product.productType?._id === selectedProductType
      );
    }
    return data?.products || EMPTY_ARRAY;
  }, [selectedProductType, data?.products]);

  // Memoize filtered product specs by selected product type
  const filteredProductSpecs = useMemo(() => {
    if (selectedProductType && data?.productSpecs) {
      return data.productSpecs.filter(
        (spec: any) => spec.productTypeId?._id === selectedProductType
      );
    }
    return data?.productSpecs || EMPTY_ARRAY;
  }, [selectedProductType, data?.productSpecs]);

  // Memoize filtered materials by selected material type
  const filteredMaterials = useMemo(() => {
    if (selectedMaterialType && data?.materials) {
      return data.materials.filter(
        (material: any) => material.materialType?._id === selectedMaterialType
      );
    }
    return data?.materials || EMPTY_ARRAY;
  }, [selectedMaterialType, data?.materials]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Loading states
    loading,
    error,

    // All data (raw)
    allData: data,

    // Individual data arrays
    customers: data?.customers || EMPTY_ARRAY,
    productTypes: data?.productTypes || EMPTY_ARRAY,
    materialTypes: data?.materialTypes || EMPTY_ARRAY,
    machineTypes: data?.machineTypes || EMPTY_ARRAY,
    machines: data?.machines || EMPTY_ARRAY,
    operators: data?.operators || EMPTY_ARRAY,
    steps: data?.steps || EMPTY_ARRAY,
    orderTypes: data?.orderTypes || EMPTY_ARRAY,

    // Options System data - ✅ NEW
    categories: data?.categories || EMPTY_ARRAY,
    optionTypes: data?.optionTypes || EMPTY_ARRAY,
    options: data?.options || EMPTY_ARRAY,
    optionSpecs: data?.optionSpecs || EMPTY_ARRAY,

    // Filtered data based on selections
    filteredProducts,
    filteredProductSpecs,
    filteredMaterials,

    // Selection setters
    setSelectedProductType,
    setSelectedMaterialType,

    // Current selections
    selectedProductType,
    selectedMaterialType
  }), [
  loading,
  error,
  data,
  filteredProducts,
  filteredProductSpecs,
  filteredMaterials,
  selectedProductType,
  selectedMaterialType]
  );
};