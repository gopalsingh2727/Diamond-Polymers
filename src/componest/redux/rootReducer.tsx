// components/redux/rootReducer.ts
import { combineReducers } from "redux";
import { LOGOUT } from "./login/authConstants";
// Auth
import authReducer from "./login/authReducer";

// Branch
import { branchListReducer, branchReducer } from "./Branch/BranchReducer";
import { branchCreateReducer } from "./createBranchAndManager/branchReducer";





// Admin & Manager
import { adminCreateReducer } from "./Admin/adminReducer";
import {
  managerCreateReducer,
  managerDeleteReducer,
  managerListReducer,
  managerUpdateReducer,
} from "./Manger/MangerReducer";

// Account
import {
  createAccountReducer,
  deleteAccountReducer,
  getAccountsReducer,
  updateAccountReducer,
} from "./create/createNewAccount/NewAccountReducer";

// Machine Types & Machines
import {
  machineTypeCreateReducer,
  machineTypeDeleteReducer,
  machineTypeListReducer,
  machineTypeUpdateReducer,
} from "./create/machineType/machineTypeReducer";
import {
  machineCreateReducer,
  machineDeleteReducer,
  machineDetailReducer,
  machineListReducer,
  machineUpdateReducer,
} from "./create/machine/MachineReducer";

// Machine Operators
import {
  operatorCreateReducer,
  operatorDeleteReducer,
  operatorListReducer,
  operatorUpdateReducer,
} from "./create/CreateMachineOpertor/MachineOpertorReducer";

// Products
import {
  productCategoryReducer,
  productTypeWithProductsReducer,
} from "./create/products/productCategories/productCategoriesReducer";

// Materials
import { materialCategoryReducer } from "./create/Materials/MaterialsCategories/MaterialsCategoriesReducer";
import {
  materialCreateReducer,
  materialDeleteReducer,
  materialListReducer,
  materialUpdateReducer,
} from "./create/Materials/MaterialReducer";

// Steps
import {
  stepCreateReducer,
  stepDeleteReducer,
  stepListReducer,
  stepUpdateReducer,
  // If you have a delete reducer, import and include it
  // stepDeleteReducer,
} from "./create/CreateStep/StepReducer";
import { createProduct } from "./create/products/ProductActions";
import { productDeleteReducer, productListReducer, productUpdateReducer } from "./create/products/ProductReducer";

// Formula
import {
  formulaCreateReducer,
  formulaListReducer,
  formulaDetailReducer,
  formulaUpdateReducer,
  formulaDeleteReducer,
  formulaTestReducer
} from "./create/formula/formulaReducer";

// Product Spec
import {
  productSpecCreateReducer,
  productSpecListReducer,
  productSpecDetailReducer,
  productSpecUpdateReducer,
  productSpecDeleteReducer
} from "./create/productSpec/productSpecReducer";

// Material Spec
import {
  materialSpecCreateReducer,
  materialSpecListReducer,
  materialSpecDetailReducer,
  materialSpecUpdateReducer,
  materialSpecDeleteReducer
} from "./create/materialSpec/materialSpecReducer";

// Order Type
import {
  orderTypeListReducer,
  orderTypeDetailReducer,
  defaultOrderTypeReducer,
  orderTypeCreateReducer
} from "./create/orderType/orderTypeReducer";

import deviceAccessReducer from "./deviceAccess/deviceAccessReducers";
import orderReducer, { accountOrdersReducer } from "./oders/orderReducers";
import orderFormDataReducer from "./oders/orderFormDataReducer";
import machineTableReducer from "./machineTable/machineTableReducer";
// import { getMaterialCategoriesReducer } from "./create/Materials/MaterialsCategories/MaterialsCategoriesActions";

// Reports
import reportReducer from "./reports/reports/reportReducer";

// ✅ Universal Data Cache
import { dataCacheReducer } from "./cache/dataCacheReducer";

const appReducer = combineReducers({
  // Auth
  auth: authReducer,

  // ✅ Universal Data Cache (reduces API calls by 90%)
  dataCache: dataCacheReducer,

  // Branch
  branches: branchReducer,
  branchList: branchListReducer,
  branchCreate: branchCreateReducer,

  // Account
  createAccount: createAccountReducer,
  getAccounts: getAccountsReducer,
  updateAccount: updateAccountReducer,
  deleteAccount: deleteAccountReducer,

  // Admin & Manager
  adminCreate: adminCreateReducer,
  managerCreate: managerCreateReducer,
  managerList: managerListReducer,
  managerUpdate: managerUpdateReducer,
  managerDelete: managerDeleteReducer,

  // Machine Types
  machineTypeCreate: machineTypeCreateReducer,
  machineTypeList: machineTypeListReducer,
  machineTypeUpdate: machineTypeUpdateReducer,
  machineTypeDelete: machineTypeDeleteReducer,
  
  // Machines
  machineCreate: machineCreateReducer,
  machineDetail: machineDetailReducer,
  machineList: machineListReducer,
  machineUpdate: machineUpdateReducer,
  machineDelete: machineDeleteReducer,

  // Machine Operators
  operatorCreate: operatorCreateReducer,
  operatorList: operatorListReducer,
  operatorUpdate: operatorUpdateReducer,
  operatorDelete: operatorDeleteReducer,

  // Product Categories and Types
  productCategories: productCategoryReducer,
  productTypeWithProductsReducer: productTypeWithProductsReducer,

  // Materials
  materialCategories: materialCategoryReducer,
  materialCreate: materialCreateReducer,
  materialList: materialListReducer,
  materialUpdate: materialUpdateReducer,
  materialDelete: materialDeleteReducer,
  // materialCategoriesList: getMaterialCategoriesReducer,
  
  // Steps
  stepCreate: stepCreateReducer,
  stepList: stepListReducer,
  stepUpdate: stepUpdateReducer,
  stepDelete: stepDeleteReducer, 


  // product
  createProduct:createProduct,
  productList:productListReducer,
  productUpdate:productUpdateReducer,
  productDelete:productDeleteReducer,

  // Formula
  formulaCreate: formulaCreateReducer,
  formulaList: formulaListReducer,
  formulaDetail: formulaDetailReducer,
  formulaUpdate: formulaUpdateReducer,
  formulaDelete: formulaDeleteReducer,
  formulaTest: formulaTestReducer,

  // Product Spec
  productSpecCreate: productSpecCreateReducer,
  productSpecList: productSpecListReducer,
  productSpecDetail: productSpecDetailReducer,
  productSpecUpdate: productSpecUpdateReducer,
  productSpecDelete: productSpecDeleteReducer,

  // Material Spec
  materialSpecCreate: materialSpecCreateReducer,
  materialSpecList: materialSpecListReducer,
  materialSpecDetail: materialSpecDetailReducer,
  materialSpecUpdate: materialSpecUpdateReducer,
  materialSpecDelete: materialSpecDeleteReducer,

  // Order Type
  orderTypeList: orderTypeListReducer,
  orderTypeDetail: orderTypeDetailReducer,
  defaultOrderType: defaultOrderTypeReducer,
  orderTypeCreate: orderTypeCreateReducer,

  //machineTable
  machineTable: machineTableReducer,

  // Orders (includes list, form, and machineTable sub-reducers)
  orders: orderReducer,
  accountOrders: accountOrdersReducer,
  orderFormData: orderFormDataReducer, // Single API call for all order form data

  //device Access create
  deviceAccess: deviceAccessReducer,

  // Reports
  reports: reportReducer,

});

const rootReducer = (state: any, action: any) => {
  if (action.type === LOGOUT) {
    state = undefined;
  }
  return appReducer(state, action);
};





export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;