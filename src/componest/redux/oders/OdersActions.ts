// actions/orderActions.ts - Complete Updated Version with Enhanced Machine ID Collection
import { Dispatch } from 'redux';
import axios from 'axios';
import {
  OrderActionTypes,
} from './orderTypes';
import {
  ORDER_SAVE_REQUEST,
  ORDER_SAVE_SUCCESS,
  ORDER_SAVE_FAILURE,
  ORDER_RESET,
  COLLECT_FORM_DATA,
  VALIDATE_FORM_DATA,
  CLEAR_FORM_DATA,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_SUCCESS_MESSAGE,
  CLEAR_SUCCESS_MESSAGE,
  GET_ACCOUNT_ORDERS_REQUEST,
  GET_ACCOUNT_ORDERS_SUCCESS,
  GET_ACCOUNT_ORDERS_FAILURE,
  FETCH_ORDER_MACHINE_TABLE_REQUEST,
  FETCH_ORDER_MACHINE_TABLE_SUCCESS,
  FETCH_ORDER_MACHINE_TABLE_FAILURE,
  CLEAR_ORDER_MACHINE_TABLE,
  ADD_MACHINE_TABLE_ROW_REQUEST,
  ADD_MACHINE_TABLE_ROW_SUCCESS,
  ADD_MACHINE_TABLE_ROW_FAILURE,
  UPDATE_MACHINE_TABLE_ROW_REQUEST,
  UPDATE_MACHINE_TABLE_ROW_SUCCESS,
  UPDATE_MACHINE_TABLE_ROW_FAILURE,
  DELETE_MACHINE_TABLE_ROW_REQUEST,
  DELETE_MACHINE_TABLE_ROW_SUCCESS,
  DELETE_MACHINE_TABLE_ROW_FAILURE
} from './OdersContants';
import { RootState } from '../rootReducer';
// Note: Axios fallback interceptor is loaded globally in main.tsx
// If primary server (api.27infinity.in) fails, it auto-switches to fallback (api.27infinity.com)

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (token: string, branchId?: string | null) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  // Add x-selected-branch header for branch-based data isolation
  const selectedBranch = branchId || localStorage.getItem("selectedBranch");
  if (selectedBranch) {
    headers["x-selected-branch"] = selectedBranch;
  }

  return headers;
};

interface SchemaAlignedOrderData {
  customerId: string;
  materialId: string;
  materialTypeId: string;
  materialWeight: number;
  Width: number;
  Height: number;
  Thickness: number;
  SealingType: string;
  BottomGusset: string;
  Flap: string;
  AirHole: string;
  Printing: boolean;
  mixMaterial: Array<{
    materialId: string;
    materialName: string;
    materialType: string;
    materialWeight: number;
    percentage: number;
  }>;
  steps: Array<{
    stepId: string;
    machines: Array<{
      machineId: string;
      machineName: string;
      machineType: string;
      operatorId?: string;
      status: 'pending' | 'in-progress' | 'completed';
      startedAt?: Date;
      completedAt?: Date;
      note?: string;
      reason?: string;
    }>;
  }>;
  branchId: string;
  createdBy: string;
  createdByRole: 'admin' | 'manager';
  product27InfinityId: string;
  Notes?: string;
  quantity?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  overallStatus?: string;
}

// Helper function to validate ObjectId format
const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Enhanced Helper functions for getting user data from token
const getCurrentUser = () => {
  try {
    // Get the auth token from localStorage
    const authToken = localStorage.getItem("authToken");
    
    if (!authToken) {
      throw new Error("Authentication token not found");
    }

    
    const tokenParts = authToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Decode the payload (second part of JWT)
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log("Decoded token payload:", payload);

    // Extract user information from token
    const userId = payload.id || payload.userId || payload.sub;
    const userRole = payload.role || 'manager';
    const username = payload.username || payload.name;
    const branchId = payload.branchId;

    if (!userId) {
      throw new Error("User ID not found in token");
    }

    return { 
      id: userId, 
      role: userRole as 'admin' | 'manager',
      username: username,
      branchId: branchId
    };

  } catch (error) {
   
    
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        return { 
          id: user._id || user.id, 
          role: user.role || 'manager' as 'admin' | 'manager',
          username: user.username || user.name,
          branchId: user.branchId
        };
      }
    } catch (fallbackError) {
      console.error("Fallback user data retrieval failed:", fallbackError);
    }
    
    // Last resort fallback
    throw new Error("Unable to get user information");
  }
};

const getCurrentBranch = () => {
  try {
    console.log("🔍 Attempting to get branch ID...");

    // First try to get from user token
    const user = getCurrentUser();
    console.log("👤 User from token:", { id: user.id, role: user.role, branchId: user.branchId || 'NOT FOUND' });

    if (user.branchId) {
      console.log("✅ Branch ID found in token:", user.branchId);
      return { id: user.branchId };
    }

    // Fallback to localStorage - check multiple possible keys
    console.log("🔍 Checking localStorage for branch ID...");
    const branchIdFromSelectedBranch = localStorage.getItem("selectedBranch");
    const branchIdFromBranchId = localStorage.getItem("branchId");
    const branchIdFromCurrentBranchId = localStorage.getItem("currentBranchId");

    console.log("📦 localStorage values:", {
      selectedBranch: branchIdFromSelectedBranch || 'NOT FOUND',
      branchId: branchIdFromBranchId || 'NOT FOUND',
      currentBranchId: branchIdFromCurrentBranchId || 'NOT FOUND'
    });

    const branchId = branchIdFromSelectedBranch || branchIdFromBranchId || branchIdFromCurrentBranchId;

    if (!branchId) {
      console.error("❌ Branch ID not found in localStorage or token");
      console.error("💡 Tip: Make sure you're logged in and your account has a branch assigned");
      throw new Error("Branch ID not found. Please ensure you're logged in and have a branch assigned to your account.");
    }

    console.log("✅ Branch ID from localStorage:", branchId);
    return { id: branchId };
  } catch (error) {
    console.error("❌ Error getting current branch:", error);
    throw error;
  }
};

const getProductInfinityId = () => {
  try {
    // Try to get from localStorage or context
    const productId = localStorage.getItem("currentProductId") || 
                     localStorage.getItem("selectedProductId") ||
                     'product27_infinity_id_here';
    return productId;
  } catch (error) {
    console.error("Error getting product infinity ID:", error);
    return 'product27_infinity_id_here';
  }
};

// Enhanced DOM Data Collection Function
const collectDataFromDOM = (): SchemaAlignedOrderData => {
  try {
    console.log("Starting enhanced DOM data collection...");

    // Collect Customer Data from DOM or localStorage
    const customerIdInput = document.querySelector('input[name="customerId"]') as HTMLInputElement;
    console.log("🔍 DEBUG - Customer ID input element found:", !!customerIdInput);
    console.log("🔍 DEBUG - Customer ID input value:", customerIdInput?.value);

    let customerId = customerIdInput?.value || '';

    // Fallback to localStorage if DOM input is empty
    if (!customerId || customerId.trim() === '') {
      customerId = localStorage.getItem('customerId') || '';
      console.log("✅ Customer ID from localStorage:", customerId);
    } else {
      console.log("✅ Customer ID from DOM input:", customerId);
    }

    if (!customerId || customerId.trim() === '') {
      throw new Error("Please select a customer from the dropdown suggestions before saving. Don't just type a name - you must click on a customer from the list.");
    }

    // Collect Order Type ID from hidden input
    const orderTypeIdInput = document.querySelector('input[name="orderTypeId"]') as HTMLInputElement;
    const orderTypeId = orderTypeIdInput?.value || '';
    console.log("Collected Order Type ID:", orderTypeId);

    // ✅ ADDED: Collect Product Spec ID from hidden input
    const productSpecIdInput = document.querySelector('input[name="productSpecId"]') as HTMLInputElement;
    const productSpecId = productSpecIdInput?.value || '';
    console.log("Collected Product Spec ID:", productSpecId);

    // ✅ REMOVED: All material-related field collection (materialId, materialTypeId, Width, Height, etc.)

    // Collect Notes
    const notesTextarea = document.querySelector('textarea[placeholder="Write your note here..."]') as HTMLTextAreaElement;

    // ✅ REMOVED: Mix material collection

    // Enhanced Manufacturing Steps Collection with Multiple Methods
    const steps: Array<{
      stepId: string;
      machines: Array<{
        machineId: string;
        machineName: string;
        machineType: string;
        operatorId?: string;
        status: 'pending' | 'in-progress' | 'completed';
        startedAt?: Date;
        completedAt?: Date;
        note?: string;
        reason?: string;
      }>;
    }> = [];

    console.log("Collecting manufacturing steps with enhanced method...");

    // Method 1: Try to get from global step container reference first
    let stepDataFromRef = null;
    if ((window as any).stepContainerRef) {
      stepDataFromRef = (window as any).stepContainerRef.getStepData();
      console.log("Step data from ref:", stepDataFromRef);
    }

    if (stepDataFromRef && stepDataFromRef.steps && stepDataFromRef.steps.length > 0) {
      console.log("Using step data from ref");
      const machines = stepDataFromRef.steps.map((step: any, index: number) => {
        console.log(`Processing machine ${index}:`, step);
        
        return {
          machineId: step.MachineId || step._Id || '',
          machineName: step.MachineName || '',
          machineType: step.MachineType || '',
          operatorId: step.OptereName || undefined,
          status: 'pending' as const,
          startedAt: step.StartTime ? new Date(step.StartTime) : undefined,
          completedAt: step.EndTime ? new Date(step.EndTime) : undefined,
          note: step.note || undefined,
          reason: undefined
        };
      });

      steps.push({
        stepId: stepDataFromRef.stepId || '',
        machines: machines
      });
    } else {
      
      
      const savedStepDisplay = document.querySelector('.savedStepDisplay');
      if (savedStepDisplay) {
       
        const stepRows = savedStepDisplay.querySelectorAll('.stepRow');
    
        if (stepRows.length > 0) {
          // Get step ID from hidden input
          const stepIdInput = document.querySelector('input[name="stepId"]') as HTMLInputElement;
          const stepId = stepIdInput?.value || '';

          console.log("Step ID from DOM:", stepId);

          const machines: Array<{
            machineId: string;
            machineName: string;
            machineType: string;
            operatorId?: string;
            status: 'pending' | 'in-progress' | 'completed';
            startedAt?: Date;
            completedAt?: Date;
            note?: string;
            reason?: string;
          }> = [];

          stepRows.forEach((row, index) => {
            const cells = row.querySelectorAll('span');
            console.log(`Step row ${index} cells:`, cells.length);

            if (cells.length >= 10) {
              // Enhanced machine ID collection - try multiple approaches
              let machineId = '';
              
              // Method 1: Get from hidden input for this specific row
              const hiddenMachineId = document.querySelector(`input[name="machineId_${index}"]`) as HTMLInputElement;
              machineId = hiddenMachineId?.value || '';
              
              // Method 2: Try alternative hidden input names
              if (!machineId) {
                const altHiddenId = document.querySelector(`input[name="machine_${index}_id"]`) as HTMLInputElement;
                machineId = altHiddenId?.value || '';
              }
              
              // Method 3: Try to get from popup inputs if popup was recently used
              if (!machineId) {
                const popupMachineId = document.querySelector(`input[name="popupMachineId_${index}"]`) as HTMLInputElement;
                machineId = popupMachineId?.value || '';
              }

              // Method 4: Try alternative popup input names
              if (!machineId) {
                const altPopupId = document.querySelector(`input[name="popup_machine_${index}_id"]`) as HTMLInputElement;
                machineId = altPopupId?.value || '';
              }

              const machineType = cells[1]?.textContent?.trim() || '';
              const machineName = cells[2]?.textContent?.trim() || '';
              const operatorName = cells[6]?.textContent?.trim() || '';
              const startTime = cells[7]?.textContent?.trim() || '';
              const endTime = cells[8]?.textContent?.trim() || '';

              console.log(`Machine ${index}:`, {
                machineId,
                machineType,
                machineName,
                operatorName,
                startTime,
                endTime
              });

              if (!machineId) {
                console.warn(`⚠️  Missing machine ID for machine: ${machineName} at index ${index}`);
              }

              machines.push({
                machineId: machineId,
                machineName: machineName,
                machineType: machineType,
                operatorId: operatorName || undefined,
                status: 'pending' as const,
                startedAt: startTime ? new Date(startTime) : undefined,
                completedAt: endTime ? new Date(endTime) : undefined,
                note: undefined,
                reason: undefined
              });
            }
          });

          if (machines.length > 0) {
            steps.push({
              stepId: stepId,
              machines: machines
            });
          }
        }
      }
    }

 

    // Get required system data
    const currentUser = getCurrentUser();
    console.log("🔍 DEBUG - Current user:", currentUser);

    const currentBranch = getCurrentBranch();
    console.log("🔍 DEBUG - Current branch:", currentBranch);

    const productInfinityId = getProductInfinityId();

    // Collect priority and status from form
    const prioritySelect = document.querySelector('select[name="priority"]') as HTMLSelectElement;
    const statusSelect = document.querySelector('select[name="overallStatus"]') as HTMLSelectElement;

    // Structure the order data
    const orderData: SchemaAlignedOrderData = {
      customerId: customerId, // ✅ FIXED: Use variable with localStorage fallback
      orderTypeId: orderTypeId,
      productSpecId: productSpecId || undefined,  // ✅ ADDED: Product Spec ID
      // ✅ REMOVED: All material fields (materialId, materialTypeId, materialWeight, Width, Height, Thickness, SealingType, BottomGusset, AirHole, Flap, Printing, mixMaterial)
      steps: steps,
      branchId: currentBranch?.id || '',
      createdBy: currentUser.id, // Use actual user ID from token
      createdByRole: currentUser.role, // Use actual user role from token
      product27InfinityId: productInfinityId || '',
      Notes: notesTextarea?.value || '',
      priority: (prioritySelect?.value as any) || 'normal',
      overallStatus: statusSelect?.value || 'Wait for Approval'
    } as any;

    console.log("=== FINAL ORDER DATA ===");
    console.log("Complete Order Data:", JSON.stringify(orderData, null, 2));
    console.log("Customer ID:", orderData.customerId);
    console.log("Steps Count:", orderData.steps.length);
    console.log("Machines with IDs:", orderData.steps.flatMap(s => s.machines).filter(m => m.machineId).length);
    console.log("Created By (from token):", orderData.createdBy);
    console.log("Created By Role (from token):", orderData.createdByRole);
    console.log("=======================");

    return orderData;
  } catch (error) {
    console.error("Error collecting order data:", error);
    // Preserve the original error message instead of generic message
    throw error instanceof Error ? error : new Error("Failed to collect order data");
  }
};


export const collectDataFromRefs = (customerRef: any, materialRef: any, stepRef?: any, additionalData?: any): SchemaAlignedOrderData => {
  try {
    console.log("Collecting data from refs...");
    console.log("Refs status:", {
      customerRef: !!customerRef?.current,
      materialRef: !!materialRef?.current,
      stepRef: !!stepRef?.current,
      additionalData: !!additionalData
    });

    // Get data from component refs - handle missing refs gracefully
    let customerData = null;
    let materialData = null;
    let stepData = null;

    try {
      customerData = customerRef?.current?.getCustomerData?.();
    } catch (e) {
      console.error("Error getting customer data:", e);
    }

    try {
      materialData = materialRef?.current?.getMaterialData?.();
    } catch (e) {
      console.log("Note: Could not get material data (may be disabled):", e);
    }

    try {
      stepData = stepRef?.current?.getStepData?.();
    } catch (e) {
      console.log("Note: Could not get step data (may be disabled):", e);
    }

    console.log("Customer Data from ref:", customerData);
    console.log("Material Data from ref:", materialData);
    console.log("Step Data from ref:", stepData);

    if (!customerData?._id) {
      console.error("Customer validation failed:", {
        customerRef: !!customerRef,
        customerRefCurrent: !!customerRef?.current,
        customerData,
        hasGetCustomerData: typeof customerRef?.current?.getCustomerData
      });
      throw new Error("Customer ID is required - please select a customer");
    }

    // Note: Don't throw error for missing material here - validation will handle it based on order type
    // Material may not be required if material section is disabled in order type
    if (!materialData?.mainMaterialId) {
      console.log("Note: Material data not provided - may be optional based on order type");
    }

    // Transform mixing data to include proper IDs (only if material data exists)
    const mixMaterial = materialData?.mixingData?.map((mix: any) => ({
      materialId: mix._id || mix.materialId || '',
      materialName: mix.name || mix.materialName || '',
      materialType: mix.type || mix.materialType || '',
      materialWeight: Number(mix.weight || mix.materialWeight) || 0,
      percentage: Number(mix.percentage) || 0
    })) || [];

    console.log("Transformed mix materials:", mixMaterial);

    // Enhanced step data transformation with better machine ID handling
    const steps = stepData ? [{
      stepId: stepData.stepId || '',
      machines: stepData.steps?.map((step: any, index: number) => {
        // Enhanced machine ID extraction with multiple fallback methods
        let machineId = step.MachineId || step._Id || step.machineId || '';
        
        // If still empty, try to get from window or DOM
        if (!machineId && typeof window !== 'undefined') {
          // Try to get from global step data if available
          const globalStepData = (window as any).stepContainerRef?.getStepData();
          if (globalStepData?.steps) {
            const matchingStep = globalStepData.steps.find((s: any) => 
              s.MachineName === step.MachineName || 
              s.machineName === step.MachineName ||
              s.MachineName === step.machineName
            );
            machineId = matchingStep?.MachineId || matchingStep?._Id || matchingStep?.machineId || '';
          }

          // Try to get from DOM hidden inputs
          if (!machineId) {
            const hiddenInput = document.querySelector(`input[name="machineId_${index}"]`) as HTMLInputElement;
            machineId = hiddenInput?.value || '';
          }
        }

        console.log(`Processing machine ${index}: ${step.MachineName || step.machineName}, MachineId: ${machineId}`);
        
        // Validate machine ID format if provided
        if (machineId && !isValidObjectId(machineId)) {
          console.warn(`Invalid machine ID format: ${machineId} for machine: ${step.MachineName || step.machineName}`);
          machineId = ''; // Clear invalid ID
        }
        
        return {
          machineId: machineId || '',
          machineName: step.MachineName || step.machineName || '',
          machineType: step.MachineType || step.machineType || '',
          operatorId: step.OptereName || step.operatorName || step.operatorId || undefined,
          status: (step.status || 'pending') as 'pending' | 'in-progress' | 'completed',
          startedAt: step.StartTime ? new Date(step.StartTime) : undefined,
          completedAt: step.EndTime ? new Date(step.EndTime) : undefined,
          note: step.note || undefined,
          reason: step.reason || undefined
        };
      }) || []
    }] : additionalData?.steps || [];

    console.log("Transformed steps with machine IDs:", JSON.stringify(steps, null, 2));

    // Get required system data with proper error handling
    const currentUser = getCurrentUser();
    const currentBranch = getCurrentBranch();
    const productInfinityId = getProductInfinityId();

    const orderData: SchemaAlignedOrderData = {
      customerId: customerData._id,
      materialId: materialData?.mainMaterialId || '',
      materialTypeId: materialData?.materialTypeId || '',
      materialWeight: Number(materialData?.totalWeight) || 0,
      Width: Number(materialData?.width) || 0,
      Height: Number(materialData?.height) || 0,
      Thickness: Number(materialData?.gauge) || 0,
      SealingType: additionalData?.sealingType || '',
      BottomGusset: materialData?.bottomGusset || '',
      AirHole: materialData?.airHole || '',
      Flap: materialData?.flap || '',
      Printing: Boolean(additionalData?.printing),
      mixMaterial: mixMaterial,
      steps: steps,
      branchId: currentBranch?.id || '',
      createdBy: currentUser.id, // Use actual user ID from token
      createdByRole: currentUser.role, // Use actual user role from token
      product27InfinityId: productInfinityId || '',
      Notes: additionalData?.notes || '',
      quantity: Number(additionalData?.quantity) || 1,
      orderTypeId: additionalData?.orderTypeId || ''
    } as any;

    console.log("=== FINAL ORDER DATA FROM REFS ===");
    console.log("Complete Order Data:", JSON.stringify(orderData, null, 2));
    console.log("Customer ID:", orderData.customerId);
    console.log("Material ID:", orderData.materialId);
    console.log("Material Type ID:", orderData.materialTypeId);
    console.log("Created By (from token):", orderData.createdBy);
    console.log("Created By Role (from token):", orderData.createdByRole);
    console.log("Branch ID:", orderData.branchId);
    console.log("Mix Materials with IDs:", orderData.mixMaterial);
    console.log("Steps with Machine IDs:", orderData.steps);
    
    // Validate that required machine IDs are present
    const machinesWithoutIds = orderData.steps.flatMap((step, stepIndex) => 
      step.machines.filter((machine) => !machine.machineId)
        .map((machine, machineIndex) => ({ stepIndex, machineIndex, machineName: machine.machineName }))
    );
    
    if (machinesWithoutIds.length > 0) {
      console.warn("⚠️  Machines without IDs found:", machinesWithoutIds);
      // You might want to show a warning to the user or handle this differently
    }
    
    console.log("===================================");

    return orderData;
  } catch (error) {
    console.error("Error collecting order data from refs:", error);
    throw new Error(`Failed to collect order data from refs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper to check if section is enabled in order type
const isSectionEnabledInOrderType = (orderTypeConfig: any, sectionId: string): boolean => {
  if (!orderTypeConfig || !orderTypeConfig.sections || orderTypeConfig.sections.length === 0) {
    // No sections configured means ALL sections are enabled (backward compatibility)
    return true;
  }
  const section = orderTypeConfig.sections.find((s: any) => s.id === sectionId);
  // If section not in config, it's NOT enabled
  return section ? section.enabled !== false : false;
};

// Enhanced validation function - now section-aware
const validateOrderData = (orderData: SchemaAlignedOrderData, orderTypeConfig?: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check which sections are enabled
  const isMaterialEnabled = isSectionEnabledInOrderType(orderTypeConfig, 'material');
  const isStepsEnabled = isSectionEnabledInOrderType(orderTypeConfig, 'steps');
  const isProductEnabled = isSectionEnabledInOrderType(orderTypeConfig, 'product');
  const isPrintingEnabled = isSectionEnabledInOrderType(orderTypeConfig, 'printing');

  console.log('🔍 Validation - Enabled sections:', {
    product: isProductEnabled,
    material: isMaterialEnabled,
    steps: isStepsEnabled,
    printing: isPrintingEnabled,
    orderTypeConfig: orderTypeConfig ? 'provided' : 'not provided'
  });

  // ✅ SIMPLIFIED: Only customerId and branchId are required
  // Check customerId
  if (!orderData.customerId || (typeof orderData.customerId === 'string' && orderData.customerId.trim() === '')) {
    console.error("Validation failed: Customer ID is missing or empty", orderData.customerId);
    errors.push("Customer is required - Please select a customer from the dropdown list (don't just type a name)");
  } else if (!isValidObjectId(orderData.customerId)) {
    console.error("Validation failed: Invalid customer ID format", orderData.customerId);
    errors.push("Invalid customer ID format");
  }

  // Check branchId
  if (!orderData.branchId || (typeof orderData.branchId === 'string' && orderData.branchId.trim() === '')) {
    console.error("Validation failed: Branch ID is missing or empty", orderData.branchId);
    errors.push("Branch ID is required. Please ensure you're logged in correctly and have a branch assigned.");
  } else if (!isValidObjectId(orderData.branchId)) {
    console.error("Validation failed: Invalid branch ID format", orderData.branchId);
    errors.push("Invalid branch ID format");
  }

  // ✅ REMOVED: createdBy validation - will be set automatically by backend
  // ✅ REMOVED: createdByRole validation - will be set automatically by backend
  // ✅ REMOVED: All material validation (materialId, materialTypeId, materialWeight, Width, Height, Thickness)
  // ✅ REMOVED: Mix materials validation
  // ✅ REMOVED: Steps validation
  // ✅ REMOVED: Product validation

  // All other fields are optional and not validated on frontend
  // No additional validation needed - backend will handle all other fields

  console.log("Validation result:", { isValid: errors.length === 0, errors });
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Action Creators
export const collectFormData = () => (dispatch: Dispatch<OrderActionTypes>) => {
  try {
    const formData = collectDataFromDOM();
    dispatch({
      type: COLLECT_FORM_DATA,
      payload: formData
    });
    return formData;
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: error instanceof Error ? error.message : "Failed to collect form data"
    });
    throw error;
  }
};

export const collectFormDataFromRefs = (customerRef: any, materialRef: any, stepRef?: any, additionalData?: any) => (dispatch: Dispatch<OrderActionTypes>) => {
  try {
    const formData = collectDataFromRefs(customerRef, materialRef, stepRef, additionalData);
    dispatch({
      type: COLLECT_FORM_DATA,
      payload: formData
    });
    return formData;
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: error instanceof Error ? error.message : "Failed to collect form data from refs"
    });
    throw error;
  }
};

export const validateFormData = (orderData: SchemaAlignedOrderData) => (dispatch: Dispatch<OrderActionTypes>) => {
  const validation = validateOrderData(orderData);
  dispatch({
    type: VALIDATE_FORM_DATA,
    payload: validation
  });
  return validation;
};

export const saveOrder = (orderData?: SchemaAlignedOrderData, orderTypeConfig?: any) => async (dispatch: Dispatch<OrderActionTypes>, getState: () => any) => {
  try {
    dispatch({ type: ORDER_SAVE_REQUEST });
    dispatch({ type: SET_LOADING, payload: true });

    // Get authentication token
    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    // Always collect from DOM (for customer, branch, user data, etc.)
    // Then merge with provided orderData (for options, etc.)
    let domData: SchemaAlignedOrderData | null = null;
    try {
      domData = collectDataFromDOM();
      console.log("📋 DOM data collected:", {
        customerId: domData.customerId,
        branchId: domData.branchId,
        createdBy: domData.createdBy
      });
    } catch (error) {
      console.warn("⚠️ Could not collect all data from DOM:", error);
      // Continue with provided orderData only
    }

    // Merge: DOM data as base, then overlay provided orderData
    let finalOrderData: SchemaAlignedOrderData;
    if (domData && orderData) {
      console.log("📋 Merging provided orderData with DOM data");
      finalOrderData = {
        ...domData,
        ...orderData,
        // Ensure critical fields from DOM are not overwritten by empty values
        customerId: orderData.customerId || domData.customerId,
        branchId: orderData.branchId || domData.branchId,
        createdBy: orderData.createdBy || domData.createdBy,
        createdByRole: orderData.createdByRole || domData.createdByRole,
      };
    } else if (domData) {
      console.log("📋 Using DOM data only");
      finalOrderData = domData;
    } else if (orderData) {
      console.log("📋 Using provided orderData only (DOM collection failed)");
      finalOrderData = orderData as SchemaAlignedOrderData;
    } else {
      throw new Error("No order data available - neither from DOM nor provided");
    }

    // Get order type config from Redux if not provided
    let finalOrderTypeConfig = orderTypeConfig;
    if (!finalOrderTypeConfig && (finalOrderData as any).orderTypeId) {
      const state = getState();
      // 🚀 OPTIMIZED: Check orderFormData first (cached), then fallback to orderTypeList
      const orderTypes = state.orderFormData?.data?.orderTypes ||
                        state.orderTypeList?.orderTypes ||
                        state.orderType?.orderTypes || [];
      finalOrderTypeConfig = orderTypes.find((ot: any) =>
        ot._id === (finalOrderData as any).orderTypeId ||
        ot.typeCode === (finalOrderData as any).orderTypeId
      );
      console.log('📋 Order type config from Redux:', finalOrderTypeConfig?.typeName || 'not found');
    }

    // Debug: Show data before validation
    console.log("🔍 DEBUG - Data before validation:");
    console.log("  Customer ID:", finalOrderData.customerId);
    console.log("  Branch ID:", finalOrderData.branchId);
    console.log("  Created By:", finalOrderData.createdBy);
    console.log("  Created By Role:", finalOrderData.createdByRole);

    const validation = validateOrderData(finalOrderData, finalOrderTypeConfig);
    console.log("Validation Result:", validation);

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    console.log("=== SENDING TO API ===");
    console.log("Final Order Data being sent to API:", JSON.stringify(finalOrderData, null, 2));
    console.log("API Endpoint:", `${baseUrl}/orders`);
    console.log("Machine IDs Check:");
    finalOrderData.steps.forEach((step, stepIndex) => {
      step.machines.forEach((machine, machineIndex) => {
        console.log(`Step ${stepIndex}, Machine ${machineIndex}: ${machine.machineName} - ID: ${machine.machineId || 'MISSING'}`);
      });
    });
    console.log("======================");

    // Check if there are any File objects in the order data
    let hasFiles = false;
    const fileMap = new Map<string, File>(); // Map to store files with their field names

    if (finalOrderData.options && Array.isArray(finalOrderData.options)) {
      finalOrderData.options.forEach((option: any, optionIndex: number) => {
        if (option.specificationValues && Array.isArray(option.specificationValues)) {
          option.specificationValues.forEach((spec: any) => {
            // Check if value is a File object (has lastModified, size, type, name properties)
            if (spec.value && typeof spec.value === 'object' &&
                'lastModified' in spec.value && 'size' in spec.value &&
                'type' in spec.value && 'name' in spec.value) {
              hasFiles = true;
              const fieldName = `file_option_${optionIndex}_spec_${spec.name}`;
              fileMap.set(fieldName, spec.value as File);
              console.log(`📎 Found File object for option ${optionIndex}, spec "${spec.name}"`);
            }
          });
        }
      });
    }

    // API call - use FormData if files are present, otherwise JSON
    let response;
    if (hasFiles && fileMap.size > 0) {
      console.log(`📤 Sending multipart/form-data with ${fileMap.size} file(s)`);

      // Build FormData
      const formData = new FormData();

      // Add all non-file fields as JSON strings
      Object.keys(finalOrderData).forEach((key) => {
        if (key === 'options') {
          // Handle options specially - keep as array but mark File objects for backend
          const optionsWithoutFiles = finalOrderData.options.map((option: any, optionIndex: number) => {
            const optionCopy = { ...option };

            if (option.specificationValues && Array.isArray(option.specificationValues)) {
              // Keep specificationValues as array, but mark File objects for backend processing
              optionCopy.specificationValues = option.specificationValues.map((spec: any) => {
                // Check if value is a File object
                if (spec.value && typeof spec.value === 'object' &&
                    'lastModified' in spec.value && 'size' in spec.value) {
                  // Mark as file upload pending (backend will fill this in)
                  return {
                    name: spec.name,
                    value: null, // Backend will replace with Firebase URL
                    unit: spec.unit || '',
                    dataType: spec.dataType || 'string'
                  };
                } else {
                  // Keep the spec as-is
                  return spec;
                }
              });
            }

            return optionCopy;
          });

          formData.append('options', JSON.stringify(optionsWithoutFiles));
        } else if (typeof finalOrderData[key as keyof typeof finalOrderData] === 'object') {
          formData.append(key, JSON.stringify(finalOrderData[key as keyof typeof finalOrderData]));
        } else {
          formData.append(key, String(finalOrderData[key as keyof typeof finalOrderData]));
        }
      });

      // Add files
      fileMap.forEach((file, fieldName) => {
        formData.append(fieldName, file);
        console.log(`📎 Added file to FormData: ${fieldName} (${file.name}, ${file.size} bytes)`);
      });

      // Send multipart/form-data
      response = await axios.post(
        `${baseUrl}/orders`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": API_KEY,
            // Don't set Content-Type - let axios set it with boundary
          }
        }
      );

      console.log(`✅ Multipart request sent successfully`);
    } else {
      console.log(`📄 Sending JSON request (no files)`);

      // Send JSON as before
      response = await axios.post(
        `${baseUrl}/orders`,
        finalOrderData,
        { headers: getAuthHeaders(token) }
      );
    }

    const result = response.data;
    console.log("API Response:", result);

    dispatch({
      type: ORDER_SAVE_SUCCESS,
      payload: result
    });

    dispatch({
      type: SET_SUCCESS_MESSAGE,
      payload: "Order saved successfully!"
    });

    dispatch({ type: SET_LOADING, payload: false });

    // ✅ Emit browser event for other components to listen (fallback when WebSocket not connected)
    window.dispatchEvent(new CustomEvent('order:updated:local', {
      detail: {
        type: 'order:created',
        data: result.data || result,
        orderId: result.data?.orderId || result.orderId
      }
    }));
    console.log('📡 [saveOrder] Dispatched order:updated:local event (type: order:created)');

    // ✅ Store flag in sessionStorage so pages can refresh on mount after navigation
    const timestamp = Date.now().toString();
    sessionStorage.setItem('orders_updated', timestamp);
    console.log('📡 [saveOrder] sessionStorage orders_updated SET to:', timestamp);

    return result;

  } catch (error: any) {
    let errorMessage = "Failed to save order";

    if (axios.isAxiosError(error)) {
      console.error("Axios Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        errorMessage = `HTTP error! status: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Save order error:", error);

    dispatch({
      type: ORDER_SAVE_FAILURE,
      payload: errorMessage
    });

    dispatch({
      type: SET_ERROR,
      payload: errorMessage
    });

    dispatch({ type: SET_LOADING, payload: false });
    throw error;
  }
};

export const saveOrderWithRefs = (customerRef: any, materialRef: any, stepRef?: any, additionalData?: any) => async (dispatch: Dispatch<OrderActionTypes>, getState: () => any) => {
  try {
    console.log("Saving order with refs...");
    const orderData = collectDataFromRefs(customerRef, materialRef, stepRef, additionalData);
    return await dispatch(saveOrder(orderData) as any);
  } catch (error) {
    console.error("Error saving order with refs:", error);
    throw error;
  }
};

// Rest of the action creators
export const resetOrderState = (): OrderActionTypes => ({
  type: ORDER_RESET
});

export const clearFormData = (): OrderActionTypes => ({
  type: CLEAR_FORM_DATA
});

export const setLoading = (loading: boolean): OrderActionTypes => ({
  type: SET_LOADING,
  payload: loading
});

export const setError = (error: string): OrderActionTypes => ({
  type: SET_ERROR,
  payload: error
});

export const clearError = (): OrderActionTypes => ({
  type: CLEAR_ERROR
});

export const setSuccessMessage = (message: string): OrderActionTypes => ({
  type: SET_SUCCESS_MESSAGE,
  payload: message
});

export const clearSuccessMessage = (): OrderActionTypes => ({
  type: CLEAR_SUCCESS_MESSAGE
});




// Fixed Redux action with proper error handling and parameter validation

const getToken = (getState: () => RootState) =>
  getState().auth?.token || localStorage.getItem("authToken");

// ✅ FIXED: Get branchId from multiple sources (token, auth state, localStorage)
const getBranchId = (getState: () => RootState) => {
  // 1. First check auth state (for managers, branchId comes from login)
  const authState = getState().auth as any;
  const authBranchId = authState?.user?.branchId;
  if (authBranchId) return authBranchId;

  // 2. Try to get from JWT token
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.branchId) return payload.branchId;
    }
  } catch (e) {
    console.warn("Could not decode token for branchId");
  }

  // 3. Fallback to localStorage (for admin/master admin who select branch)
  return localStorage.getItem("selectedBranch") ||
         localStorage.getItem("branchId") ||
         localStorage.getItem("currentBranchId");
};

// ✅ FIXED: Made accountId optional so Daybook can filter by date only
interface OrderFilters {
  accountId?: string; // ✅ Now optional
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  customerId?: string;
  branchId?: string;
  materialId?: string;
  createdBy?: string;
  startDate?: string; // ✅ Filter by specific date
  endDate?: string; // ✅ Filter by date range
  search?: string;
}

export const fetchOrders= (filters?: OrderFilters) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      console.log("🚀 Starting fetchOrdersTyped with filters:", filters);
      
      dispatch({ type: SET_LOADING, payload: true });
      
      const token = getToken(getState);
      console.log(token );

      const branchId = getBranchId(getState);
      const userRole = (getState().auth as any)?.user?.role;
      
      console.log("🔑 Authentication details:", {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        branchId,
        userRole
      });
      
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }
      
      // Check if user is admin type (admin or masterAdmin)
      const isAdminRole = userRole === 'admin' || userRole === 'masterAdmin';

      // For non-admin users, branchId is required
      if (!isAdminRole && !branchId) {
        throw new Error("Branch ID missing. Please select a branch.");
      }

      // Type-safe filter cleaning
      const cleanFilters: Record<string, string | number> = {};

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanFilters[key] = String(value);
          }
        });
      }

      // Add branchId for non-admin users (managers must filter by their branch)
      if (!isAdminRole && !cleanFilters.branchId && branchId) {
        cleanFilters.branchId = branchId;
      }

      console.log("🔍 Clean filters being sent:", cleanFilters);

      const queryParams = Object.keys(cleanFilters).length > 0 
        ? `?${new URLSearchParams(cleanFilters).toString()}`
        : '';

      const requestUrl = `${baseUrl}/orders${queryParams}`;
      console.log("📡 Making request to:", requestUrl);

      // Build request headers with all required headers
      const requestHeaders: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      };

      // Add x-selected-branch header for branch-based data isolation
      if (branchId) {
        requestHeaders['x-selected-branch'] = branchId;
      }

      console.log("📋 Request headers:", {
        ...requestHeaders,
        Authorization: requestHeaders.Authorization.substring(0, 20) + '...'
      });

      const response = await axios.get(requestUrl, {
        headers: requestHeaders,
        timeout: 90000
      });

      console.log("✅ Response received:", {
        status: response.status,
        dataKeys: Object.keys(response.data),
        ordersCount: response.data?.data?.orders?.length || 0
      });

      console.log("📊 Full response data:", response.data);
      
      dispatch({
        type: 'FETCH_ORDERS_SUCCESS',
        payload: response.data
      });

      dispatch({ type: SET_LOADING, payload: false });
      return response.data;

    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      
      let errorMessage = "Failed to fetch orders";
      
      if (axios.isAxiosError(error)) {
        console.log("🔍 Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });

        switch (error.response?.status) {
          case 401:
            errorMessage = "Authentication failed. Please log in again.";
            localStorage.removeItem("authToken");
            break;
          case 403:
            errorMessage = "Access denied. You don't have permission to view these orders.";
            break;
          case 404:
            errorMessage = "Orders not found.";
            break;
          case 429:
            errorMessage = "Too many requests. Please wait and try again.";
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response?.data?.message || error.message || "Failed to fetch orders";
        }
      } else {
        errorMessage = error.message || "Network error occurred";
      }

      dispatch({
        type: SET_ERROR,
        payload: errorMessage
      });

      dispatch({ type: SET_LOADING, payload: false });
      
      if (error.response?.status === 401) {
        return null;
      }
      
      throw error;
    }
  };

// Usage examples:
/*
// Basic usage
dispatch(fetchOrders());

// With filters
dispatch(fetchOrders({
  page: 1,
  limit: 20,
  status: 'pending',
  sortBy: 'createdAt',
  sortOrder: 'desc'
}));

// With date range
dispatch(fetchOrders({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  limit: 50
}));

// With search
dispatch(fetchOrders({
  search: 'order123',
  page: 1,
  limit: 10
}));




*/


// Add these action types to your OdersActions.js
export const UPDATE_ORDER_REQUEST = 'UPDATE_ORDER_REQUEST';
export const UPDATE_ORDER_SUCCESS = 'UPDATE_ORDER_SUCCESS';
export const UPDATE_ORDER_FAILURE = 'UPDATE_ORDER_FAILURE';

// Add this action creator to your OdersActions.js
// Interfaces for the order update functionality
interface UpdatedOrderData {
  [key: string]: any; // For dynamic fields
  updatedAt: string;
}

interface UpdateOrderSuccessPayload {
  order: UpdatedOrderData;
  message: string;
}

interface OrderUpdateResponse {
  order: UpdatedOrderData;
  message: string;
}

export const updateOrder = (orderId: string, orderData: Partial<UpdatedOrderData>) => {
  return async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: UPDATE_ORDER_REQUEST });

      // ✅ FIXED: Use getToken helper like other functions
      const token = getToken(getState);

      // Collect fresh data from DOM to ensure we have latest customer/branch info
      let domData: SchemaAlignedOrderData | null = null;
      try {
        domData = collectDataFromDOM();
        console.log("📋 UPDATE - DOM data collected:", {
          customerId: domData.customerId,
          branchId: domData.branchId
        });
      } catch (error) {
        console.warn("⚠️ UPDATE - Could not collect all data from DOM:", error);
        // Continue with provided orderData only
      }

      // Merge DOM data with provided orderData
      const updatedOrderData: UpdatedOrderData = domData ? {
        ...domData,
        ...orderData,
        // Ensure critical fields from DOM are not overwritten by empty values
        customerId: orderData.customerId || domData.customerId,
        branchId: orderData.branchId || domData.branchId,
        // Add any additional fields that need to be updated
        updatedAt: new Date().toISOString()
      } : {
        ...orderData,
        // Add any additional fields that need to be updated
        updatedAt: new Date().toISOString()
      } as UpdatedOrderData;

      const updateUrl = `${baseUrl}/orders/${orderId}`;
      console.log('🔄 UPDATE ORDER - URL:', updateUrl);
      console.log('🔄 UPDATE ORDER - orderId:', orderId);
      console.log('🔄 UPDATE ORDER - baseUrl:', baseUrl);
      console.log('🔄 UPDATE ORDER - Data:', updatedOrderData);

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': API_KEY
        },
        body: JSON.stringify(updatedOrderData)
      });

      console.log('🔄 UPDATE ORDER - Response status:', response.status);
      console.log('🔄 UPDATE ORDER - Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedOrder: OrderUpdateResponse = await response.json();
      
      dispatch({
        type: UPDATE_ORDER_SUCCESS,
        payload: {
          order: updatedOrder,
          message: 'Order updated successfully!'
        } as UpdateOrderSuccessPayload
      });

      // Optionally refresh the orders list
      dispatch(fetchOrders() as any);

      // ✅ Emit browser event for other components to listen (fallback when WebSocket not connected)
      window.dispatchEvent(new CustomEvent('order:updated:local', {
        detail: {
          type: 'order:updated',
          data: updatedOrder,
          orderId: orderId
        }
      }));
      console.log('📡 [updateOrder] Dispatched order:updated:local event');

      // ✅ Store flag in sessionStorage so pages can refresh on mount after navigation
      const timestamp = Date.now().toString();
      sessionStorage.setItem('orders_updated', timestamp);
      console.log('📡 [updateOrder] sessionStorage orders_updated SET to:', timestamp);

      // ✅ FIXED: Return the updated order so caller can check success
      return updatedOrder;

    } catch (error: unknown) {
      console.error('Update order error:', error);
      dispatch({
        type: UPDATE_ORDER_FAILURE,
        payload: error instanceof Error ? error.message : 'Failed to update order'
      });
      // Return error object so caller knows it failed
      return { error: error instanceof Error ? error.message : 'Failed to update order' };
    }
  };
};








export const getAccountOrders = (accountId: string, filters?: OrderFilters) => 
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      dispatch({ type: GET_ACCOUNT_ORDERS_REQUEST });

      const token = getToken(getState);
      const branchId = getBranchId(getState);
      const role = (getState().auth as any)?.user?.role;

      if (!accountId || accountId.trim() === '') {
        throw new Error('Customer ID is required');
      }

      const cleanFilters: Record<string, string | number> = { 
        customerId: accountId.trim()  // Ensure no whitespace
      };
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanFilters[key] = value;
          }
        });
      }

      if (role !== 'admin' && branchId) {
        cleanFilters.branchId = branchId;
      }

      console.log('Sending customerId:', accountId);
      console.log('Clean filters:', cleanFilters);
    
      const query = new URLSearchParams(cleanFilters as any).toString();
      const url = `${baseUrl}/orders/customer?${query}`;
      
      console.log('Final URL:', url);

      const response = await axios.get(url, {
        headers: {
          ...getAuthHeaders(token, branchId),
          customerId: accountId.trim(),
        }
      });

      dispatch({
        type: GET_ACCOUNT_ORDERS_SUCCESS,
        payload: response.data?.data?.orders || []
      });
    } catch (error: any) {
      dispatch({
        type: GET_ACCOUNT_ORDERS_FAILURE,
        payload: error.message || 'Failed to fetch account orders'
      });
    }
  };

// ============================================================================
// MACHINE TABLE DATA ACTIONS (for Orders)
// ============================================================================

/**
 * Fetch machine table data for a specific machine in an order
 * @param orderId - The ID of the order
 * @param machineId - The ID of the machine
 */
export const fetchOrderMachineTableData = (orderId: string, machineId: string) =>
  async (dispatch: Dispatch, getState: () => any) => {
    try {
      console.log('🔍 Fetching machine table data:', { orderId, machineId });
      
      dispatch({ type: FETCH_ORDER_MACHINE_TABLE_REQUEST });

      const token = getToken(getState);

      // Validate inputs
      if (!orderId || !machineId) {
        throw new Error('Order ID and Machine ID are required');
      }

      const response = await axios.get(
        `${baseUrl}/orders/${orderId}/machines/${machineId}/table-data`,
        {
          headers: getAuthHeaders(token),
        }
      );

      console.log('✅ Machine table data fetched successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: FETCH_ORDER_MACHINE_TABLE_SUCCESS,
          payload: response.data.data,
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('❌ Error fetching machine table data:', error);

      let errorMessage = 'Failed to fetch machine table data';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Machine or order not found';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: FETCH_ORDER_MACHINE_TABLE_FAILURE,
        payload: errorMessage,
      });

      throw error;
    }
  };

/**
 * Clear machine table data from state
 */
export const clearOrderMachineTable = () => ({
  type: CLEAR_ORDER_MACHINE_TABLE,
});

/**
 * Add a new row to machine table
 * @param orderId - The ID of the order
 * @param machineId - The ID of the machine
 * @param rowData - The data for the new row
 */
export const addMachineTableRow = (orderId: string, machineId: string, rowData: any) =>
  async (dispatch: Dispatch, getState: () => any) => {
    try {
      console.log('➕ Adding machine table row:', { orderId, machineId, rowData });

      dispatch({ type: ADD_MACHINE_TABLE_ROW_REQUEST });

      const token = getToken(getState);

      const response = await axios.post(
        `${baseUrl}/orders/${orderId}/machines/${machineId}/table-data/rows`,
        { rowData },
        {
          headers: getAuthHeaders(token),
        }
      );

      console.log('✅ Row added successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: ADD_MACHINE_TABLE_ROW_SUCCESS,
          payload: response.data.data,
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('❌ Error adding table row:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to add table row';

      dispatch({
        type: ADD_MACHINE_TABLE_ROW_FAILURE,
        payload: errorMessage,
      });

      throw error;
    }
  };

/**
 * Update an existing row in machine table
 * @param orderId - The ID of the order
 * @param machineId - The ID of the machine
 * @param rowIndex - The index of the row to update
 * @param rowData - The updated data for the row
 */
export const updateMachineTableRow = (orderId: string, machineId: string, rowIndex: number, rowData: any) =>
  async (dispatch: Dispatch, getState: () => any) => {
    try {
      console.log('✏️ Updating machine table row:', { orderId, machineId, rowIndex, rowData });

      dispatch({ type: UPDATE_MACHINE_TABLE_ROW_REQUEST });

      const token = getToken(getState);

      const response = await axios.put(
        `${baseUrl}/orders/${orderId}/machines/${machineId}/table-data/rows/${rowIndex}`,
        { rowData },
        {
          headers: getAuthHeaders(token),
        }
      );

      console.log('✅ Row updated successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: UPDATE_MACHINE_TABLE_ROW_SUCCESS,
          payload: response.data.data,
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('❌ Error updating table row:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to update table row';

      dispatch({
        type: UPDATE_MACHINE_TABLE_ROW_FAILURE,
        payload: errorMessage,
      });

      throw error;
    }
  };

/**
 * Delete a row from machine table
 * @param orderId - The ID of the order
 * @param machineId - The ID of the machine
 * @param rowIndex - The index of the row to delete
 */
export const deleteMachineTableRow = (orderId: string, machineId: string, rowIndex: number) =>
  async (dispatch: Dispatch, getState: () => any) => {
    try {
      console.log('🗑️ Deleting machine table row:', { orderId, machineId, rowIndex });

      dispatch({ type: DELETE_MACHINE_TABLE_ROW_REQUEST });

      const token = getToken(getState);

      const response = await axios.delete(
        `${baseUrl}/orders/${orderId}/machines/${machineId}/table-data/rows/${rowIndex}`,
        {
          headers: getAuthHeaders(token),
        }
      );

      console.log('✅ Row deleted successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: DELETE_MACHINE_TABLE_ROW_SUCCESS,
          payload: response.data.data,
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('❌ Error deleting table row:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete table row';

      dispatch({
        type: DELETE_MACHINE_TABLE_ROW_FAILURE,
        payload: errorMessage,
      });

      throw error;
    }
  };

// ============================================================================
// DELETE ORDER ACTION
// ============================================================================

export const DELETE_ORDER_REQUEST = 'DELETE_ORDER_REQUEST';
export const DELETE_ORDER_SUCCESS = 'DELETE_ORDER_SUCCESS';
export const DELETE_ORDER_FAILURE = 'DELETE_ORDER_FAILURE';

/**
 * Delete an order by ID
 * @param orderId - The ID of the order to delete
 */
export const deleteOrder = (orderId: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      console.log('🗑️ Deleting order:', orderId);

      dispatch({ type: DELETE_ORDER_REQUEST });

      const token = getToken(getState);

      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await axios.delete(
        `${baseUrl}/orders/${orderId}`,
        {
          headers: getAuthHeaders(token),
        }
      );

      console.log('✅ Order deleted successfully:', response.data);

      dispatch({
        type: DELETE_ORDER_SUCCESS,
        payload: orderId,
      });

      // ✅ Emit browser event for other components to listen (fallback when WebSocket not connected)
      window.dispatchEvent(new CustomEvent('order:updated:local', {
        detail: {
          type: 'order:deleted',
          data: { _id: orderId },
          orderId: orderId
        }
      }));
      console.log('📡 [deleteOrder] Dispatched order:updated:local event (type: order:deleted)');

      // ✅ Store flag in sessionStorage so pages can refresh on mount after navigation
      const timestamp = Date.now().toString();
      sessionStorage.setItem('orders_updated', timestamp);
      console.log('📡 [deleteOrder] sessionStorage orders_updated SET to:', timestamp);

      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting order:', error);

      let errorMessage = 'Failed to delete order';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Order not found';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: DELETE_ORDER_FAILURE,
        payload: errorMessage,
      });

      throw error;
    }
  };
