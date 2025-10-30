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
  GET_ACCOUNT_ORDERS_REQUEST,GET_ACCOUNT_ORDERS_SUCCESS ,GET_ACCOUNT_ORDERS_FAILURE


} from './OdersContants';
import { RootState } from '../rootReducer';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
});

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
    // First try to get from user token
    const user = getCurrentUser();
    if (user.branchId) {
      return { id: user.branchId };
    }

    // Fallback to localStorage
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) {
      console.error("Branch ID not found in localStorage or token");
      throw new Error("Branch ID not found");
    }
    return { id: branchId };
  } catch (error) {
    console.error("Error getting current branch:", error);
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

    // Collect Customer Data from DOM
    const customerIdInput = document.querySelector('input[name="customerId"]') as HTMLInputElement;
    console.log("Collected Customer ID:", customerIdInput?.value);
    if (!customerIdInput?.value) {
      throw new Error("Customer ID is required");
    }

    // Collect Main Material IDs from hidden inputs - Enhanced search
    let mainMaterialIdInput = document.querySelector('input[name="mainMaterialId"]') as HTMLInputElement;
    let materialTypeIdInput = document.querySelector('input[name="materialTypeId"]') as HTMLInputElement;

    // Fallback: Try different selectors if hidden inputs are not found
    if (!mainMaterialIdInput) {
      mainMaterialIdInput = document.querySelector('input[type="hidden"][name="mainMaterialId"]') as HTMLInputElement;
    }
    if (!materialTypeIdInput) {
      materialTypeIdInput = document.querySelector('input[type="hidden"][name="materialTypeId"]') as HTMLInputElement;
    }

    // If still not found, try to get from data attributes or other sources
    let mainMaterialId = mainMaterialIdInput?.value || '';
    let materialTypeId = materialTypeIdInput?.value || '';

    // Additional fallback - try to get from window object if stored there
    if (!mainMaterialId || !materialTypeId) {
      console.warn("Material IDs not found in hidden inputs, trying alternative methods...");
      const windowAny = window as any;
      if (windowAny.currentMaterialData) {
        mainMaterialId = mainMaterialId || windowAny.currentMaterialData.mainMaterialId || '';
        materialTypeId = materialTypeId || windowAny.currentMaterialData.materialTypeId || '';
        console.log("Got IDs from window object:", { mainMaterialId, materialTypeId });
      }
    }

    // Collect Material Data from DOM
    const widthInput = document.querySelector('input[placeholder="Enter Width"]') as HTMLInputElement;
    const heightInput = document.querySelector('input[placeholder="Enter Height"]') as HTMLInputElement;
    const gaugeInput = document.querySelector('input[placeholder="Enter Gauge/Micron"]') as HTMLInputElement;
    const totalWeightInput = document.querySelector('input[placeholder="Total Weight"]') as HTMLInputElement;

    // Collect optional fields
    const bottomGussetInput = document.querySelector('input[placeholder="Enter Bottom Gusset"]') as HTMLInputElement;
    const flapInput = document.querySelector('input[placeholder="Enter Flap"]') as HTMLInputElement;
    const airHoleInput = document.querySelector('input[placeholder="Enter Air Hole"]') as HTMLInputElement;

    // Collect Sealing Type
    const sealingTypeInput = document.querySelector('select[name="sealingType"]') as HTMLSelectElement;

    // Collect Notes
    const notesTextarea = document.querySelector('textarea[placeholder="Write your note here..."]') as HTMLTextAreaElement;

    // Enhanced Mixing Data Collection
    const mixMaterial: Array<{
      materialId: string;
      materialName: string;
      materialType: string;
      materialWeight: number;
      percentage: number;
    }> = [];

    console.log("Collecting mixing materials...");
    const mixingRows = document.querySelectorAll('.SaveMixingstepRow');
    console.log("Found mixing rows:", mixingRows.length);

    if (mixingRows.length > 0) {
      mixingRows.forEach((row, index) => {
        const cells = row.querySelectorAll('span');
        console.log(`Row ${index} cells:`, cells.length);

        if (cells.length >= 5) {
          // Try multiple ways to get the material ID
          let hiddenMaterialId = document.querySelector(`input[name="mixMaterialId_${index}"]`) as HTMLInputElement;

          // Alternative selectors for hidden material ID
          if (!hiddenMaterialId) {
            hiddenMaterialId = document.querySelector(`input[type="hidden"][name="mixMaterialId_${index}"]`) as HTMLInputElement;
          }

          const materialName = cells[1]?.textContent?.trim() || '';
          const materialType = cells[2]?.textContent?.trim() || '';
          const weight = cells[3]?.textContent?.trim() || '';
          const percentage = cells[4]?.textContent?.replace('%', '')?.trim() || '';

          console.log(`Mix material ${index}:`, {
            materialId: hiddenMaterialId?.value,
            materialName,
            materialType,
            weight,
            percentage
          });

          if (materialName && weight && !isNaN(Number(weight))) {
            mixMaterial.push({
              materialId: hiddenMaterialId?.value || '',
              materialName: materialName,
              materialType: materialType,
              materialWeight: Number(weight),
              percentage: Number(percentage) || 0
            });
          }
        }
      });
    }

    console.log("Final collected mix materials:", mixMaterial);

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
    const currentBranch = getCurrentBranch();
    const productInfinityId = getProductInfinityId();

    // Structure the order data
    const orderData: SchemaAlignedOrderData = {
      customerId: customerIdInput.value,
      materialId: mainMaterialId,
      materialTypeId: materialTypeId,
      materialWeight: Number(totalWeightInput?.value) || 0,
      Width: Number(widthInput?.value) || 0,
      Height: Number(heightInput?.value) || 0,
      Thickness: Number(gaugeInput?.value) || 0,
      SealingType: sealingTypeInput?.value || '',
      BottomGusset: bottomGussetInput?.value || '',
      AirHole: airHoleInput?.value || '',
      Flap: flapInput?.value || '',
      Printing: false,
      mixMaterial: mixMaterial,
      steps: steps,
      branchId: currentBranch?.id || '',
      createdBy: currentUser.id, // Use actual user ID from token
      createdByRole: currentUser.role, // Use actual user role from token
      product27InfinityId: productInfinityId || '',
      Notes: notesTextarea?.value || ''
    };

    console.log("=== FINAL ORDER DATA ===");
    console.log("Complete Order Data:", JSON.stringify(orderData, null, 2));
    console.log("Customer ID:", orderData.customerId);
    console.log("Material ID:", orderData.materialId);
    console.log("Material Type ID:", orderData.materialTypeId);
    console.log("Mix Materials Count:", orderData.mixMaterial.length);
    console.log("Steps Count:", orderData.steps.length);
    console.log("Machines with IDs:", orderData.steps.flatMap(s => s.machines).filter(m => m.machineId).length);
    console.log("Created By (from token):", orderData.createdBy);
    console.log("Created By Role (from token):", orderData.createdByRole);
    console.log("=======================");

    return orderData;
  } catch (error) {
    console.error("Error collecting order data:", error);
    throw new Error("Failed to collect order data");
  }
};


export const collectDataFromRefs = (customerRef: any, materialRef: any, stepRef?: any, additionalData?: any): SchemaAlignedOrderData => {
  try {
    console.log("Collecting data from refs...");

    // Get data from component refs
    const customerData = customerRef.current?.getCustomerData();
    const materialData = materialRef.current?.getMaterialData();
    const stepData = stepRef?.current?.getStepData();

    console.log("Customer Data from ref:", customerData);
    console.log("Material Data from ref:", materialData);
    console.log("Step Data from ref:", stepData);

    if (!customerData?._id) {
      throw new Error("Customer ID is required");
    }

    if (!materialData?.mainMaterialId) {
      console.error("Material data structure:", materialData);
      throw new Error("Main Material ID is required");
    }

    // Transform mixing data to include proper IDs
    const mixMaterial = materialData.mixingData?.map((mix: any) => ({
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
      materialId: materialData.mainMaterialId,
      materialTypeId: materialData.materialTypeId || '',
      materialWeight: Number(materialData.totalWeight) || 0,
      Width: Number(materialData.width) || 0,
      Height: Number(materialData.height) || 0,
      Thickness: Number(materialData.gauge) || 0,
      SealingType: additionalData?.sealingType || '',
      BottomGusset: materialData.bottomGusset || '',
      AirHole: materialData.airHole || '',
      Flap: materialData.flap || '',
      Printing: Boolean(additionalData?.printing),
      mixMaterial: mixMaterial,
      steps: steps,
      branchId: currentBranch?.id || '',
      createdBy: currentUser.id, // Use actual user ID from token
      createdByRole: currentUser.role, // Use actual user role from token
      product27InfinityId: productInfinityId || '',
      Notes: additionalData?.notes || '',
      quantity: Number(additionalData?.quantity) || 1
    };

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

// Enhanced validation function
const validateOrderData = (orderData: SchemaAlignedOrderData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required field validation
  if (!orderData.customerId?.trim()) {
    errors.push("Customer is required");
  } else if (!isValidObjectId(orderData.customerId)) {
    errors.push("Invalid customer ID format");
  }

  if (!orderData.materialId?.trim()) {
    errors.push("Main Material ID is required");
  } else if (!isValidObjectId(orderData.materialId)) {
    errors.push("Invalid material ID format");
  }

  if (!orderData.materialTypeId?.trim()) {
    errors.push("Material Type ID is required");
  } else if (!isValidObjectId(orderData.materialTypeId)) {
    errors.push("Invalid material type ID format");
  }

  if (!orderData.materialWeight || orderData.materialWeight <= 0) {
    errors.push("Valid material weight is required");
  }

  if (!orderData.Width || orderData.Width <= 0) {
    errors.push("Valid width is required");
  }

  if (!orderData.Height || orderData.Height <= 0) {
    errors.push("Valid height is required");
  }

  if (!orderData.Thickness || orderData.Thickness <= 0) {
    errors.push("Valid thickness is required");
  }

  if (!orderData.branchId?.trim()) {
    errors.push("Branch ID is required");
  } else if (!isValidObjectId(orderData.branchId)) {
    errors.push("Invalid branch ID format");
  }

  if (!orderData.createdBy?.trim()) {
    errors.push("Created by user ID is required");
  } else if (!isValidObjectId(orderData.createdBy)) {
    errors.push("Invalid creator user ID format");
  }

  if (!orderData.createdByRole || !['admin', 'manager'].includes(orderData.createdByRole)) {
    errors.push("Valid creator role is required");
  }

  if (!orderData.product27InfinityId?.trim()) {
    errors.push("Product 27 Infinity ID is required");
  }

  // Validate mix materials
  if (orderData.mixMaterial && orderData.mixMaterial.length > 0) {
    orderData.mixMaterial.forEach((mix, index) => {
      if (mix.materialId && !isValidObjectId(mix.materialId)) {
        errors.push(`Mix material ${index + 1}: Invalid material ID format`);
      }
      if (!mix.materialWeight || mix.materialWeight <= 0) {
        errors.push(`Mix material ${index + 1}: Valid weight is required`);
      }
    });
  }

  // Validate steps and machines
  if (!orderData.steps || orderData.steps.length === 0) {
    errors.push("At least one manufacturing step is required");
  } else {
    orderData.steps.forEach((step, stepIndex) => {
      if (!step.stepId || !isValidObjectId(step.stepId)) {
        errors.push(`Step ${stepIndex + 1}: Valid step ID is required`);
      }
      
      if (!step.machines || step.machines.length === 0) {
        errors.push(`Step ${stepIndex + 1}: At least one machine is required`);
      } else {
        step.machines.forEach((machine, machineIndex) => {
          if (machine.machineId && !isValidObjectId(machine.machineId)) {
            errors.push(`Step ${stepIndex + 1}, Machine ${machineIndex + 1}: Invalid machine ID format`);
          }
          if (machine.operatorId && !isValidObjectId(machine.operatorId)) {
            errors.push(`Step ${stepIndex + 1}, Machine ${machineIndex + 1}: Invalid operator ID format`);
          }
        });
      }
    });
  }

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

export const saveOrder = (orderData?: SchemaAlignedOrderData) => async (dispatch: Dispatch<OrderActionTypes>, getState: () => any) => {
  try {
    dispatch({ type: ORDER_SAVE_REQUEST });
    dispatch({ type: SET_LOADING, payload: true });

    // Get authentication token
    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    let finalOrderData = orderData;
    if (!finalOrderData) {
      finalOrderData = collectDataFromDOM();
    }

    const validation = validateOrderData(finalOrderData);
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

    // API call
    const response = await axios.post(
      `${baseUrl}/orders`,
      finalOrderData,
      { headers: getAuthHeaders(token) }
    );

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

const getBranchId = () => localStorage.getItem("selectedBranch");

// export const fetchOrders = (filters?: any) => 
//   async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
//     try {
//       dispatch({ type: SET_LOADING, payload: true });
      
//       const token = getToken(getState);
//       const branchId = getBranchId();
      
//       // Validate required data
//       if (!token) {
//         throw new Error("Authentication token missing. Please log in again.");
//       }
      
//       if (!branchId) {
//         throw new Error("Branch ID missing. Please select a branch.");
//       }

//       // Clean filters - remove undefined, null, or empty string values
//       const cleanFilters = filters ? Object.entries(filters).reduce((acc, [key, value]) => {
//         if (value !== undefined && value !== null && value !== '') {
//           acc[key] = value;
//         }
//         return acc;
//       }, {} as Record<string, any>) : {};

//       // Add branchId to filters if not already present and user role requires it
//       const userState = getState();
//       const userRole = userState.auth?.user?.role;
      
//       // Only add branchId filter for non-admin users if not already specified
//       if (userRole !== 'admin' && !cleanFilters.branchId) {
//         cleanFilters.branchId = branchId;
//       }

//       // Build query string only if we have filters
//       const queryParams = Object.keys(cleanFilters).length > 0 
//         ? `?${new URLSearchParams(cleanFilters).toString()}` 
//         : '';

//       console.log('Fetching orders with filters:', cleanFilters);
//       console.log('Query params:', queryParams);

//       const response = await axios.get(`${baseUrl}/orders${queryParams}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'x-api-key': API_KEY,
//           'Content-Type': 'application/json'
//         },
//         timeout: 30000 // 30 second timeout
//       });

//       // Validate response data
//       if (!response.data) {
//         throw new Error("Invalid response from server");
//       }

//       dispatch({
//         type: 'FETCH_ORDERS_SUCCESS',
//         payload: response.data
//       });

//       dispatch({ type: SET_LOADING, payload: false });
//       return response.data;

//     } catch (error: any) {
//       console.error('Error fetching orders:', error);
      
//       let errorMessage = "Failed to fetch orders";
      
//       if (axios.isAxiosError(error)) {
//         if (error.response?.status === 401) {
//           errorMessage = "Authentication failed. Please log in again.";
//           // Optional: Clear auth token and redirect to login
//           localStorage.removeItem("authToken");
//           // dispatch(logout()); // Uncomment if you have a logout action
//         } else if (error.response?.status === 403) {
//           errorMessage = "Access denied. You don't have permission to view these orders.";
//         } else if (error.response?.status === 404) {
//           errorMessage = "Orders endpoint not found.";
//         } else if (error.response?.status >= 500) {
//           errorMessage = "Server error. Please try again later.";
//         } else if (error.response?.data?.message) {
//           errorMessage = error.response.data.message;
//         } else if (error.code === 'ECONNABORTED') {
//           errorMessage = "Request timeout. Please check your connection and try again.";
//         } else if (error.message) {
//           errorMessage = error.message;
//         }
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       dispatch({
//         type: SET_ERROR,
//         payload: errorMessage
//       });

//       dispatch({ type: SET_LOADING, payload: false });
      
//       // Don't re-throw the error if it's an auth error to prevent cascading failures
//       if (error.response?.status === 401) {
//         return null;
//       }
      
//       throw error;
//     }
//   };

// Alternative version with better TypeScript typing:
interface OrderFilters {
  accountId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  customerId?: string;
  branchId?: string;
  materialId?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const fetchOrders= (filters?: OrderFilters) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      console.log("🚀 Starting fetchOrdersTyped with filters:", filters);
      
      dispatch({ type: SET_LOADING, payload: true });
      
      const token = getToken(getState);
      console.log(token );
      
      const branchId = getBranchId();
      const userRole = getState().auth?.user?.role;
      
      console.log("🔑 Authentication details:", {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        branchId,
        userRole
      });
      
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }
      
      // For non-admin users, branchId is required
      if (userRole !== 'admin' && !branchId) {
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

      // Add branchId for non-admin users
      if (userRole !== 'admin' && !cleanFilters.branchId && branchId) {
        cleanFilters.branchId = branchId;
      }

      console.log("🔍 Clean filters being sent:", cleanFilters);

      const queryParams = Object.keys(cleanFilters).length > 0 
        ? `?${new URLSearchParams(cleanFilters).toString()}`
        : '';

      const requestUrl = `${baseUrl}/orders${queryParams}`;
      console.log("📡 Making request to:", requestUrl);

     
      const requestHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      
      };

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
      
      const state = getState();
      const token = state.auth.token; // Adjust path based on your auth state structure
      
      // Get current form data from relevant components
      const updatedOrderData: UpdatedOrderData = {
        ...orderData,
        // Add any additional fields that need to be updated
        updatedAt: new Date().toISOString()
      };
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedOrderData)
      });
      
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
      dispatch(fetchOrders());
      
    } catch (error: unknown) {
      console.error('Update order error:', error);
      dispatch({
        type: UPDATE_ORDER_FAILURE,
        payload: error instanceof Error ? error.message : 'Failed to update order'
      });
    }
  };
};








export const getAccountOrders = (accountId: string, filters?: OrderFilters) => 
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      dispatch({ type: GET_ACCOUNT_ORDERS_REQUEST });

      const token = getToken(getState);
      const branchId = getBranchId();
      const role = getState().auth?.user?.role;

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
          Authorization: `Bearer ${token}`,
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