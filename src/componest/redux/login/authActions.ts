import axios from "axios";
import {
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
} from "./authConstants";

export const login = (username: string, password: string) => {
  return async (dispatch: any) => {
    dispatch({ type: LOGIN_REQUEST });

    const loginEndpoints = [
      { url: "http://localhost:3000/dev/admin/login", role: "admin" },
      { url: "http://localhost:3000/dev/manager/login", role: "manager" },
    ];

    for (const endpoint of loginEndpoints) {
      try {
        const response = await axios.post(endpoint.url, { username, password });

        const { token, user, branches } = response.data;

        // Add role and branches into userData object
        const userData = { ...user, role: endpoint.role, branches };

        // Save token and userData to localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token,
            userData,
          },
        });

        return; // stop after successful login
      } catch (err) {
       
      }
    }

    // If all endpoints fail
    dispatch({
      type: LOGIN_FAIL,
      payload: "Invalid username or password",
    });
  };
};

export const logout = () => {
  return (dispatch: any) => {
    localStorage.removeItem("selectedBranch")
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    dispatch({ type: LOGOUT });
  };
};


export const SET_SELECTED_BRANCH_IN_AUTH = "SET_SELECTED_BRANCH_IN_AUTH";

export const setSelectedBranchInAuth = (branchId: string) => {
  console.log("Selected branchId:", branchId); 

  
  return (dispatch: any) => {
    localStorage.setItem("selectedBranch", branchId);
    dispatch({
      type: SET_SELECTED_BRANCH_IN_AUTH,
      payload: branchId,
    });
  };
};