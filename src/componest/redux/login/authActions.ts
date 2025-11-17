import axios from "axios";
import {
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
} from "./authConstants";
import { getOrderFormDataIfNeeded, clearOrderFormData } from "../oders/orderFormDataActions";

export const SET_SELECTED_BRANCH_IN_AUTH = "SET_SELECTED_BRANCH_IN_AUTH";

// ✅ Base URL and API Key from env
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ Login
export const login = (email: string, password: string) => {
  return async (dispatch: any) => {
    dispatch({ type: LOGIN_REQUEST });

    const loginEndpoints = [
      { url: `${baseUrl}/admin/login`, role: "admin" },
      { url: `${baseUrl}/manager/login`, role: "manager" },
    ];

    for (const endpoint of loginEndpoints) {
      try {
        const response = await axios.post(
          endpoint.url,
          { email, password },
          {
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );

        const { token, user, branches } = response.data;
        const userData = { ...user, role: endpoint.role, branches };

        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        console.log(userData, "this call"); // To inspect the full object
console.log(localStorage.getItem("selectedBranch"), "selectedBranch from localStorage");
console.log(localStorage.getItem("userData"), "userData string from localStorage");

        




        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token,
            userData,
          },
        });

        // ✅ Fetch form data if user has selected a branch (uses cache if available)
        const selectedBranch = userData.selectedBranch || localStorage.getItem("selectedBranch");
        if (selectedBranch) {
          try {
            await dispatch(getOrderFormDataIfNeeded() as any);
          } catch (error) {
            console.error("Failed to fetch order form data on login:", error);
          }
        }

        return; // Stop after first successful login
      } catch (err: any) {
        console.error(`Login failed for ${endpoint.role}`, err?.response?.data || err.message);
      }
    }

    // If both failed
    dispatch({
      type: LOGIN_FAIL,
      payload: "Invalid email or password",
    });
  };
};

// ✅ Logout
export const logout = () => {
  return (dispatch: any) => {
    localStorage.removeItem("selectedBranch");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // ✅ Clear order form data cache
    dispatch(clearOrderFormData());

    dispatch({ type: LOGOUT });
  };
};

// ✅ Set Selected Branch
// authActions.ts


// ✅ Set Selected Branch
export const setSelectedBranchInAuth = (branchId: string) => {
  return async (dispatch: any) => {
    // Get existing userData from localStorage
    const storedData = localStorage.getItem("userData");
    const userData = storedData ? JSON.parse(storedData) : {};

    // Update the userData object with the new branch
    const updatedUserData = {
      ...userData,
      selectedBranch: branchId,
    };

    // Save the updated userData back to localStorage
    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    // Dispatch the action to update Redux store
    dispatch({
      type: SET_SELECTED_BRANCH_IN_AUTH,
      payload: branchId,
    });

    // ✅ Fetch form data for the newly selected branch (uses cache if available)
    try {
      await dispatch(getOrderFormDataIfNeeded() as any);
    } catch (error) {
      console.error("Failed to fetch order form data for branch:", error);
    }
  };
};