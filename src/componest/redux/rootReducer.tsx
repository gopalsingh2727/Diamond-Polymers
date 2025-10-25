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
import { deviceAccessCreateReducer, deviceAccessReducer } from "./deviceAccess/deviceAccessReducers";
import { accountOrdersReducer, orderListReducer} from "./oders/orderReducers";
// import { getMaterialCategoriesReducer } from "./create/Materials/MaterialsCategories/MaterialsCategoriesActions";

const appReducer = combineReducers({
  // Auth
  auth: authReducer,

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



  orderList: orderListReducer,
 accountOrders:  accountOrdersReducer,
  //device Access create 
 
  deviceAccess: deviceAccessReducer,


});

const rootReducer = (state: any, action: any) => {
  if (action.type === LOGOUT) {
    state = undefined;
  }
  return appReducer(state, action);
};





export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;