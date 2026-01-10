/**
 * 🚀 Optimized Order Form Data Actions (V2 APIs - Parallel)
 *
 * Replaces slow /order/form-data endpoint (1.4s) with fast V2 APIs (300ms)
 *
 * BEFORE: 1 slow endpoint, 9 sequential queries
 * AFTER: 9 fast V2 endpoints, parallel execution
 */

import axios from "axios";
import { Dispatch } from "redux";
import { RootState } from "../rootReducer";

// Import existing V2 actions
import { getAccountsV2 } from "../unifiedV2/accountActions";
import { getMachinesV2 } from "../unifiedV2/machineActions";
import { getOperatorsV2 } from "../unifiedV2/operatorActions";
import { getStepsV2 } from "../unifiedV2/stepActions";
import { getOrderTypesV2 } from "../unifiedV2/orderTypeActions";
import { getCategoriesV2 } from "../unifiedV2/categoryActions";
import { getOptionTypesV2 } from "../unifiedV2/optionTypeActions";
import { getOptionsV2 } from "../unifiedV2/optionActions";
import { getOptionSpecsV2 } from "../unifiedV2/optionSpecActions";
import { getMachineTypesV2 } from "../unifiedV2/machineTypeActions";

// Action Types
export const GET_ORDER_FORM_DATA_V2_REQUEST = "GET_ORDER_FORM_DATA_V2_REQUEST";
export const GET_ORDER_FORM_DATA_V2_SUCCESS = "GET_ORDER_FORM_DATA_V2_SUCCESS";
export const GET_ORDER_FORM_DATA_V2_FAIL = "GET_ORDER_FORM_DATA_V2_FAIL";
export const CLEAR_ORDER_FORM_DATA_V2 = "CLEAR_ORDER_FORM_DATA_V2";

/**
 * 🚀 OPTIMIZED: Fetch all order form data using V2 APIs in parallel
 *
 * Performance: ~300ms (vs 1.4s for old endpoint)
 *
 * Uses:
 * - GET /v2/account (for customers/accounts)
 * - GET /v2/machine (for machines)
 * - GET /v2/operator (for operators)
 * - GET /v2/step (for steps)
 * - GET /v2/order-type (for order types)
 * - GET /v2/category (for categories)
 * - GET /v2/option-type (for option types)
 * - GET /v2/option (for options)
 * - GET /v2/option-spec (for option specs)
 * - GET /v2/machine-type (for machine types)
 */
export const getOrderFormDataV2 = () => async (
  dispatch: Dispatch<any>,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_ORDER_FORM_DATA_V2_REQUEST });

    const branchId = localStorage.getItem("selectedBranch");

    if (import.meta.env.DEV) {
      console.log('🚀 getOrderFormDataV2: Fetching using V2 APIs in parallel...');
      console.log('   Branch:', branchId);
    }

    // ✅ PARALLEL EXECUTION: All 10 API calls run simultaneously (~300ms total)
    const startTime = Date.now();

    const [
      customers,
      machines,
      operators,
      steps,
      orderTypes,
      categories,
      optionTypes,
      options,
      optionSpecs,
      machineTypes
    ] = await Promise.all([
      (dispatch(getAccountsV2()) as any).catch((err: any) => { console.error('❌ getAccountsV2 failed:', err.message); throw err; }),
      (dispatch(getMachinesV2()) as any).catch((err: any) => { console.error('❌ getMachinesV2 failed:', err.message); throw err; }),
      (dispatch(getOperatorsV2()) as any).catch((err: any) => { console.error('❌ getOperatorsV2 failed:', err.message); throw err; }),
      (dispatch(getStepsV2()) as any).catch((err: any) => { console.error('❌ getStepsV2 failed:', err.message); throw err; }),
      (dispatch(getOrderTypesV2()) as any).catch((err: any) => { console.error('❌ getOrderTypesV2 failed:', err.message); throw err; }),
      (dispatch(getCategoriesV2()) as any).catch((err: any) => { console.error('❌ getCategoriesV2 failed:', err.message); throw err; }),
      (dispatch(getOptionTypesV2()) as any).catch((err: any) => { console.error('❌ getOptionTypesV2 failed:', err.message); throw err; }),
      (dispatch(getOptionsV2()) as any).catch((err: any) => { console.error('❌ getOptionsV2 failed:', err.message); throw err; }),
      (dispatch(getOptionSpecsV2()) as any).catch((err: any) => { console.error('❌ getOptionSpecsV2 failed:', err.message); throw err; }),
      (dispatch(getMachineTypesV2()) as any).catch((err: any) => { console.error('❌ getMachineTypesV2 failed:', err.message); throw err; }),
    ]);

    const duration = Date.now() - startTime;

    // Format data to match old /order/form-data structure
    const formData = {
      customers: Array.isArray(customers) ? customers : [],
      machines: Array.isArray(machines) ? machines : [],
      operators: Array.isArray(operators) ? operators : [],
      steps: Array.isArray(steps) ? steps : [],
      orderTypes: Array.isArray(orderTypes) ? orderTypes : [],
      categories: Array.isArray(categories) ? categories : [],
      optionTypes: Array.isArray(optionTypes) ? optionTypes : [],
      options: Array.isArray(options) ? options : [],
      optionSpecs: Array.isArray(optionSpecs) ? optionSpecs : [],
      machineTypes: Array.isArray(machineTypes) ? machineTypes : [],
    };

    if (import.meta.env.DEV) {
      console.log(`✅ Fetched order form data in ${duration}ms (V2 APIs, parallel)`);
      console.log('   Customers:', formData.customers.length);
      console.log('   Machines:', formData.machines.length);
      console.log('   Operators:', formData.operators.length);
      console.log('   Steps:', formData.steps.length);
      console.log('   Order Types:', formData.orderTypes.length);
      console.log('   Categories:', formData.categories.length);
      console.log('   Option Types:', formData.optionTypes.length);
      console.log('   Options:', formData.options.length);
      console.log('   Option Specs:', formData.optionSpecs.length);
      console.log('   Machine Types:', formData.machineTypes.length);
    }

    dispatch({
      type: GET_ORDER_FORM_DATA_V2_SUCCESS,
      payload: formData
    });

    return formData;
  } catch (error: any) {
    console.error('❌ getOrderFormDataV2 failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    dispatch({
      type: GET_ORDER_FORM_DATA_V2_FAIL,
      payload: error.response?.data?.message || error.message
    });

    throw error;
  }
};

/**
 * Smart helper: Only fetches if cache is missing or expired
 *
 * Checks Redux state first, only calls API if:
 * - No data exists
 * - Data is older than 24 hours
 * - User switched branches
 */
export const getOrderFormDataV2IfNeeded = () => async (
  dispatch: Dispatch<any>,
  getState: () => RootState
) => {
  const state = getState();
  const orderFormData = state.orderFormData;
  const currentBranch = localStorage.getItem("selectedBranch");

  // Check if we already have valid data
  if (orderFormData?.data && orderFormData?.lastFetched) {
    const lastFetchedTime = new Date(orderFormData.lastFetched).getTime();
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // Check if data is for the current branch
    const cachedBranch = orderFormData.branchId;

    // If cache is still valid and for same branch, don't fetch
    if (
      now - lastFetchedTime < CACHE_DURATION &&
      cachedBranch === currentBranch
    ) {
      if (import.meta.env.DEV) {
        console.log('✅ Using cached order form data (V2)');
      }
      return orderFormData.data;
    } else {
      if (import.meta.env.DEV) {
        console.log('🔄 Cache expired or branch changed, refetching...');
      }
    }
  }

  // Fetch fresh data
  return dispatch(getOrderFormDataV2());
};

/**
 * Clear order form data from Redux
 * Use this on logout or branch switch
 */
export const clearOrderFormDataV2 = () => (dispatch: Dispatch) => {
  dispatch({ type: CLEAR_ORDER_FORM_DATA_V2 });
};

/**
 * Force refresh order form data
 * Clears cache and forces a new API call
 */
export const refreshOrderFormDataV2 = () => async (
  dispatch: Dispatch<any>,
  getState: () => RootState
) => {
  dispatch({ type: CLEAR_ORDER_FORM_DATA_V2 });
  return dispatch(getOrderFormDataV2());
};
