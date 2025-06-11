import {
  ADD_PRODUCT_CATEGORY_REQUEST,
  ADD_PRODUCT_CATEGORY_SUCCESS,
  ADD_PRODUCT_CATEGORY_FAIL,
  GET_PRODUCT_CATEGORIES_REQUEST,
  GET_PRODUCT_CATEGORIES_SUCCESS,
  GET_PRODUCT_CATEGORIES_FAIL,
  GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_REQUEST,
  GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_SUCCESS,
  GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_FAIL,
} from "./productCategoriesContants";

interface ProductCategory {
  _id: string;
  productTypeName: string;
  branchId: string;
}

interface ProductCategoryState {
  loading: boolean;
  categories: ProductCategory[];
  error: string | null;
  success?: boolean;
}

const initialProductCategoryState: ProductCategoryState = {
  loading: false,
  categories: [],
  error: null,
};

export const productCategoryReducer = (
  state = initialProductCategoryState,
  action: any
): ProductCategoryState => {
  switch (action.type) {
    case ADD_PRODUCT_CATEGORY_REQUEST:
    case GET_PRODUCT_CATEGORIES_REQUEST:
      return { ...state, loading: true, success: false };

    case ADD_PRODUCT_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        categories: [...state.categories, action.payload],
      };

    case GET_PRODUCT_CATEGORIES_SUCCESS:
      return {
        loading: false,
        success: true,
        categories: action.payload,
        error: null,
      };

    case ADD_PRODUCT_CATEGORY_FAIL:
    case GET_PRODUCT_CATEGORIES_FAIL:
      return { ...state, loading: false, success: false, error: action.payload };

    default:
      return state;
  }
};

// NEW SEPARATE STATE AND REDUCER
interface ProductTypeWithProductsState {
  loading: boolean;
  items: any[]; // You can replace `any` with a detailed type later
  error: string | null;
}

const initialProductTypeWithProductsState: ProductTypeWithProductsState = {
  loading: false,
  items: [],
  error: null,
};

export const productTypeWithProductsReducer = (
  state = initialProductTypeWithProductsState,
  action: any
): ProductTypeWithProductsState => {
  switch (action.type) {
    case GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_REQUEST:
      return { ...state, loading: true };

    case GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_SUCCESS:
      return { loading: false, items: action.payload, error: null };

    case GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_FAIL:
      return { loading: false, items: [], error: action.payload };

    default:
      return state;
  }
};