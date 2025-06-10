import { ADD_PRODUCT_CATEGORY, SET_PRODUCT_CATEGORIES } from "./ProductContants";

const initialState = {
  categories: [],
};

export const productCategoryReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ADD_PRODUCT_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case SET_PRODUCT_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      };

    default:
      return state;
  }
};