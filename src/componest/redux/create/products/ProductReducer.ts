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

// Types
interface Product {
  _id: string;
  productName: string;
  productType: string;
  price: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  branchId: string;
}

interface Action<T = any> {
  type: string;
  payload?: T;
}

// CREATE
interface ProductState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialCreateState: ProductState = {
  loading: false,
  success: false,
  error: null,
};

export const productCreateReducer = (
  state = initialCreateState,
  action: Action
): ProductState => {
  switch (action.type) {
    case CREATE_PRODUCT_REQUEST:
      return { loading: true, success: false, error: null };
    case CREATE_PRODUCT_SUCCESS:
      return { loading: false, success: true, error: null };
    case CREATE_PRODUCT_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// LIST
interface ProductListState {
  loading?: boolean;
  products: Product[];
  error?: string;
}

const initialListState: ProductListState = {
  loading: false,
  products: [],
};

export const productListReducer = (
  state = initialListState,
  action: Action
): ProductListState => {
  switch (action.type) {
    case GET_PRODUCTS_REQUEST:
      return { loading: true, products: [] };
    case GET_PRODUCTS_SUCCESS:
      return {
        loading: false,
        products: Array.isArray(action.payload)
          ? action.payload
          : action.payload.products,
      };
    case GET_PRODUCTS_FAIL:
      return { loading: false, products: [], error: action.payload };
    default:
      return state;
  }
};

// UPDATE
interface SimpleState {
  loading?: boolean;
  success?: boolean;
  error?: string;
}

export const productUpdateReducer = (
  state: SimpleState = {},
  action: Action
): SimpleState => {
  switch (action.type) {
    case UPDATE_PRODUCT_REQUEST:
      return { loading: true };
    case UPDATE_PRODUCT_SUCCESS:
      return { loading: false, success: true };
    case UPDATE_PRODUCT_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// DELETE
export const productDeleteReducer = (
  state: SimpleState = {},
  action: Action
): SimpleState => {
  switch (action.type) {
    case DELETE_PRODUCT_REQUEST:
      return { loading: true };
    case DELETE_PRODUCT_SUCCESS:
      return { loading: false, success: true };
    case DELETE_PRODUCT_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};