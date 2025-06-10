import axios from "axios";
import {
  MANAGER_CREATE_REQUEST,
  MANAGER_CREATE_SUCCESS,
  MANAGER_CREATE_FAIL,
} from "./MangerContants";

export const newcreateManager = (data: { 
  username: string; 
  password: string; 
  branchId: string 
}) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: MANAGER_CREATE_REQUEST });
    
    // 1. Improve token retrieval
    const token = getState().auth?.token || localStorage.getItem("authToken") || "";
    
    // 2. Validate token exists before making request
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    // 3. Use environment variable for API base URL
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
    
    // 4. Make the API request
    const response = await axios.post(
      `${API_URL}/dev/manager/create`, 
      data, 
      config
    );

    // 5. Validate response structure
    if (response.data && response.data.success) {
      dispatch({
        type: MANAGER_CREATE_SUCCESS,
        payload: response.data.manager || response.data,
      });
    } else {
      throw new Error("Unexpected response format from server");
    }
  } catch (error: any) {
    // 6. Improved error handling
    let errorMessage = "Something went wrong";
    
    if (error.response) {
      // Server responded with error status (4xx/5xx)
      errorMessage = error.response.data?.message || 
                    error.response.statusText || 
                    `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "No response from server. Check your network connection.";
    } else {
      // Other errors (like token validation error)
      errorMessage = error.message || error.toString();
    }

    console.error("Manager creation failed:", errorMessage, error);
    
    dispatch({
      type: MANAGER_CREATE_FAIL,
      payload: errorMessage,
    });
  }
};