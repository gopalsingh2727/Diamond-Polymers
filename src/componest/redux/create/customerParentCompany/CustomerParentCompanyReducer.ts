import {
  CREATE_CUSTOMER_PARENT_COMPANY_REQUEST,
  CREATE_CUSTOMER_PARENT_COMPANY_SUCCESS,
  CREATE_CUSTOMER_PARENT_COMPANY_FAIL,
  GET_CUSTOMER_PARENT_COMPANIES_REQUEST,
  GET_CUSTOMER_PARENT_COMPANIES_SUCCESS,
  GET_CUSTOMER_PARENT_COMPANIES_FAIL,
  UPDATE_CUSTOMER_PARENT_COMPANY_REQUEST,
  UPDATE_CUSTOMER_PARENT_COMPANY_SUCCESS,
  UPDATE_CUSTOMER_PARENT_COMPANY_FAIL,
  DELETE_CUSTOMER_PARENT_COMPANY_REQUEST,
  DELETE_CUSTOMER_PARENT_COMPANY_SUCCESS,
  DELETE_CUSTOMER_PARENT_COMPANY_FAIL,
} from "./CustomerParentCompanyConstants";

// Types
interface CustomerParentCompany {
  _id: string;
  name: string;
  description?: string;
  branchId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomerParentCompanyState {
  loading: boolean;
  success?: boolean;
  error?: string | null;
  parentCompanies?: CustomerParentCompany[];
  updatedParentCompany?: CustomerParentCompany;
  deletedParentCompanyId?: string;
  createdParentCompany?: CustomerParentCompany;
}

// Create Customer Parent Company Reducer
export const createCustomerParentCompanyReducer = (
  state: CustomerParentCompanyState = { loading: false },
  action: any
): CustomerParentCompanyState => {
  switch (action.type) {
    case CREATE_CUSTOMER_PARENT_COMPANY_REQUEST:
      return { loading: true };
    case CREATE_CUSTOMER_PARENT_COMPANY_SUCCESS:
      return { loading: false, success: true, createdParentCompany: action.payload };
    case CREATE_CUSTOMER_PARENT_COMPANY_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// Get All Customer Parent Companies Reducer
export const getCustomerParentCompaniesReducer = (
  state: CustomerParentCompanyState = { loading: false, parentCompanies: [] },
  action: any
): CustomerParentCompanyState => {
  switch (action.type) {
    case GET_CUSTOMER_PARENT_COMPANIES_REQUEST:
      return { ...state, loading: true };
    case GET_CUSTOMER_PARENT_COMPANIES_SUCCESS:
      return { loading: false, parentCompanies: action.payload };
    case GET_CUSTOMER_PARENT_COMPANIES_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// Update Customer Parent Company Reducer
export const updateCustomerParentCompanyReducer = (
  state: CustomerParentCompanyState = { loading: false },
  action: any
): CustomerParentCompanyState => {
  switch (action.type) {
    case UPDATE_CUSTOMER_PARENT_COMPANY_REQUEST:
      return { loading: true };
    case UPDATE_CUSTOMER_PARENT_COMPANY_SUCCESS:
      return { loading: false, success: true, updatedParentCompany: action.payload };
    case UPDATE_CUSTOMER_PARENT_COMPANY_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// Delete Customer Parent Company Reducer
export const deleteCustomerParentCompanyReducer = (
  state: CustomerParentCompanyState = { loading: false },
  action: any
): CustomerParentCompanyState => {
  switch (action.type) {
    case DELETE_CUSTOMER_PARENT_COMPANY_REQUEST:
      return { loading: true };
    case DELETE_CUSTOMER_PARENT_COMPANY_SUCCESS:
      return { loading: false, success: true, deletedParentCompanyId: action.payload };
    case DELETE_CUSTOMER_PARENT_COMPANY_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};
