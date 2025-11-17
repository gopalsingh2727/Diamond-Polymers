import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrderFormDataIfNeeded } from "../../../redux/oders/orderFormDataActions";
import { RootState } from "../../../redux/rootReducer";

/**
 * Custom hook to manage order form data
 * Fetches ALL data in ONE API call on mount (uses cache if available)
 * Provides filtered data based on selections
 */
export const useOrderFormData = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.orderFormData || {}
  );

  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>("");

  // Fetch all data on mount (uses cache if available - no redundant API calls!)
  useEffect(() => {
    dispatch(getOrderFormDataIfNeeded() as any);
  }, [dispatch]);

  // Filter products by selected product type
  const filteredProducts = selectedProductType && data?.products
    ? data.products.filter(
        (product: any) => product.productType?._id === selectedProductType
      )
    : data?.products || [];

  // Filter product specs by selected product type
  const filteredProductSpecs = selectedProductType && data?.productSpecs
    ? data.productSpecs.filter(
        (spec: any) => spec.productTypeId?._id === selectedProductType
      )
    : data?.productSpecs || [];

  // Filter materials by selected material type
  const filteredMaterials = selectedMaterialType && data?.materials
    ? data.materials.filter(
        (material: any) => material.materialType?._id === selectedMaterialType
      )
    : data?.materials || [];

  return {
    // Loading states
    loading,
    error,

    // All data (raw)
    allData: data,

    // Individual data arrays
    customers: data?.customers || [],
    productTypes: data?.productTypes || [],
    materialTypes: data?.materialTypes || [],
    machineTypes: data?.machineTypes || [],
    machines: data?.machines || [],
    operators: data?.operators || [],
    steps: data?.steps || [],

    // Filtered data based on selections
    filteredProducts,
    filteredProductSpecs,
    filteredMaterials,

    // Selection setters
    setSelectedProductType,
    setSelectedMaterialType,

    // Current selections
    selectedProductType,
    selectedMaterialType,
  };
};