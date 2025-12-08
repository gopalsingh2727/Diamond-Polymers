import {
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
} from './categoryActions';

interface CategoryState {
  categories: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

const categoryReducer = (state = initialState, action: any): CategoryState => {
  switch (action.type) {
    // CREATE
    case CREATE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: [action.payload, ...state.categories],
      };
    case CREATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // GET ALL
    case GET_CATEGORIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload,
      };
    case GET_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // UPDATE
    case UPDATE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category
        ),
      };
    case UPDATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // DELETE
    case DELETE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.filter(
          (category) => category._id !== action.payload
        ),
      };
    case DELETE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default categoryReducer;
