import {
  CREATE_CUSTOMER_CATEGORY_REQUEST,
  CREATE_CUSTOMER_CATEGORY_SUCCESS,
  CREATE_CUSTOMER_CATEGORY_FAIL,
  GET_CUSTOMER_CATEGORIES_REQUEST,
  GET_CUSTOMER_CATEGORIES_SUCCESS,
  GET_CUSTOMER_CATEGORIES_FAIL,
  UPDATE_CUSTOMER_CATEGORY_REQUEST,
  UPDATE_CUSTOMER_CATEGORY_SUCCESS,
  UPDATE_CUSTOMER_CATEGORY_FAIL,
  DELETE_CUSTOMER_CATEGORY_REQUEST,
  DELETE_CUSTOMER_CATEGORY_SUCCESS,
  DELETE_CUSTOMER_CATEGORY_FAIL,
} from "./CustomerCategoryConstants";

// Types
interface CustomerCategory {
  _id: string;
  name: string;
  description?: string;
  branchId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomerCategoryState {
  loading: boolean;
  success?: boolean;
  error?: string | null;
  categories?: CustomerCategory[];
  updatedCategory?: CustomerCategory;
  deletedCategoryId?: string;
  createdCategory?: CustomerCategory;
}

// Create Customer Category Reducer
export const createCustomerCategoryReducer = (
  state: CustomerCategoryState = { loading: false },
  action: any
): CustomerCategoryState => {
  switch (action.type) {
    case CREATE_CUSTOMER_CATEGORY_REQUEST:
      return { loading: true };
    case CREATE_CUSTOMER_CATEGORY_SUCCESS:
      return { loading: false, success: true, createdCategory: action.payload };
    case CREATE_CUSTOMER_CATEGORY_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// Get All Customer Categories Reducer
export const getCustomerCategoriesReducer = (
  state: CustomerCategoryState = { loading: false, categories: [] },
  action: any
): CustomerCategoryState => {
  switch (action.type) {
    case GET_CUSTOMER_CATEGORIES_REQUEST:
      return { ...state, loading: true };
    case GET_CUSTOMER_CATEGORIES_SUCCESS:
      return { loading: false, categories: action.payload };
    case GET_CUSTOMER_CATEGORIES_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// Update Customer Category Reducer
export const updateCustomerCategoryReducer = (
  state: CustomerCategoryState = { loading: false },
  action: any
): CustomerCategoryState => {
  switch (action.type) {
    case UPDATE_CUSTOMER_CATEGORY_REQUEST:
      return { loading: true };
    case UPDATE_CUSTOMER_CATEGORY_SUCCESS:
      return { loading: false, success: true, updatedCategory: action.payload };
    case UPDATE_CUSTOMER_CATEGORY_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// Delete Customer Category Reducer
export const deleteCustomerCategoryReducer = (
  state: CustomerCategoryState = { loading: false },
  action: any
): CustomerCategoryState => {
  switch (action.type) {
    case DELETE_CUSTOMER_CATEGORY_REQUEST:
      return { loading: true };
    case DELETE_CUSTOMER_CATEGORY_SUCCESS:
      return { loading: false, success: true, deletedCategoryId: action.payload };
    case DELETE_CUSTOMER_CATEGORY_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};
