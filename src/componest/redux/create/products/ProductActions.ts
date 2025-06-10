import axios from "axios";
import {
  ADD_PRODUCT_CATEGORY,
  SET_PRODUCT_CATEGORIES,
} from "./ProductContants";

export const setProductCategories = (categories: string[]) => ({
  type: SET_PRODUCT_CATEGORIES,
  payload: categories,
});

export const addProductCategory = (categoryName: string) => {
  return async (dispatch: any, getState: any) => {
    try {
      const token = getState().auth?.token || localStorage.getItem("authToken");
      console.log('jhjh');
      
      // Get branchId from state or localStorage
      const branchId =
        getState().auth?.selectedBranch || localStorage.getItem("selectedBranch");

      if (!branchId) {
        throw new Error("Branch ID is missing.");
      }
      console.log(branchId , 'product');
      
      const response = await axios.post(
        "http://localhost:3000/dev/producttype",
        { categoryName, branchId }, // 👈 include branchId here
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch({
        type: ADD_PRODUCT_CATEGORY,
        payload: response.data.categoryName || categoryName,
      });

    } catch (error: any) {
      console.error("Failed to add category:", error.response?.data || error.message);
    }
  };
};