import {
  ADD_MATERIAL_CATEGORY_REQUEST,
  ADD_MATERIAL_CATEGORY_SUCCESS,
  ADD_MATERIAL_CATEGORY_FAIL,
  GET_MATERIAL_CATEGORIES_REQUEST,
  GET_MATERIAL_CATEGORIES_SUCCESS,
  GET_MATERIAL_CATEGORIES_FAIL,
  GET_ALL_MATERIAL_TYPES_REQUEST,
  GET_ALL_MATERIAL_TYPES_SUCCESS,
  GET_ALL_MATERIAL_TYPES_FAIL,
  UPDATE_MATERIAL_CATEGORY_REQUEST,
  UPDATE_MATERIAL_CATEGORY_SUCCESS,
  UPDATE_MATERIAL_CATEGORY_FAIL,
  DELETE_MATERIAL_CATEGORY_REQUEST,
  DELETE_MATERIAL_CATEGORY_SUCCESS,
  DELETE_MATERIAL_CATEGORY_FAIL,
} from "./MaterialsCategoriesContants";

interface MaterialType {
  _id: string;
  materialTypeName: string;
  branchId: string;
  materials: any[];
}

interface MaterialCategoryState {
  loading: boolean;
  categories: MaterialType[];
  error: string | null;
  success: boolean;
}

const initialState: MaterialCategoryState = {
  loading: false,
  categories: [],
  error: null,
  success: false,
};

export const materialCategoryReducer = (
  state = initialState,
  action: any
): MaterialCategoryState => {
  switch (action.type) {
    case ADD_MATERIAL_CATEGORY_REQUEST:
    case GET_MATERIAL_CATEGORIES_REQUEST:
    case GET_ALL_MATERIAL_TYPES_REQUEST:
    case UPDATE_MATERIAL_CATEGORY_REQUEST:
    case DELETE_MATERIAL_CATEGORY_REQUEST:
      return { ...state, loading: true, success: false };

    case ADD_MATERIAL_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        categories: [...state.categories, action.payload],
      };

    case GET_MATERIAL_CATEGORIES_SUCCESS:
    case GET_ALL_MATERIAL_TYPES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload,
        success: false,
      };

    case UPDATE_MATERIAL_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        categories: state.categories.map((cat) =>
          cat._id === action.payload._id ? action.payload : cat
        ),
      };

    case DELETE_MATERIAL_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        categories: state.categories.filter(
          (cat) => cat._id !== action.payload
        ),
      };

    case ADD_MATERIAL_CATEGORY_FAIL:
    case GET_MATERIAL_CATEGORIES_FAIL:
    case GET_ALL_MATERIAL_TYPES_FAIL:
    case UPDATE_MATERIAL_CATEGORY_FAIL:
    case DELETE_MATERIAL_CATEGORY_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };

    default:
      return state;
  }
};