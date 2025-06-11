import axios from "axios";
import {
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAIL,
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAIL,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAIL,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAIL,
} from "./ProductContants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// ✅ Create Product
export const createProduct = (product: {
  productName: string;
  price: number;
  productType: string;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const payload = { ...product, branchId };

    const { data } = await axios.post("/dev/product", payload, config);

    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_PRODUCT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Get Products
export const getProducts = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRODUCTS_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data } = await axios.get(`/dev/product?branchId=${branchId}`, config);

    dispatch({ type: GET_PRODUCTS_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: GET_PRODUCTS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Update Product
export const updateProduct = (
  id: string,
  updateData: {
    productName?: string;
    productType?: string;
    price?: number;
    sizeX?: number;
    sizeY?: number;
    sizeZ?: number;
  }
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data } = await axios.put(`/dev/product/${id}`, { ...updateData, branchId }, config);

    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: UPDATE_PRODUCT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Delete Product
export const deleteProduct = (id: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    await axios.delete(`/dev/product/${id}`, config);

    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: DELETE_PRODUCT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};