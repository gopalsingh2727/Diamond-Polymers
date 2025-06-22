import axios from "axios";
import {
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
} from "./authConstants";

export const SET_SELECTED_BRANCH_IN_AUTH = "SET_SELECTED_BRANCH_IN_AUTH";

// ✅ Base URL and API Key from env
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ Login
export const login = (username: string, password: string) => {
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
          { username, password },
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

        return; // Stop after first successful login
      } catch (err: any) {
        console.error(`Login failed for ${endpoint.role}`, err?.response?.data || err.message);
      }
    }

    // If both failed
    dispatch({
      type: LOGIN_FAIL,
      payload: "Invalid username or password",
    });
  };
};

// ✅ Logout
export const logout = () => {
  return (dispatch: any) => {
    localStorage.removeItem("selectedBranch");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    dispatch({ type: LOGOUT });
  };
};

// ✅ Set Selected Branch
export const setSelectedBranchInAuth = (branchId: string) => {
  return (dispatch: any) => {
    localStorage.setItem("selectedBranch", branchId);
    dispatch({
      type: SET_SELECTED_BRANCH_IN_AUTH,
      payload: branchId,
    });
  };
}; 