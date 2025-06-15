// components/redux/rootReducer.ts
import { combineReducers } from "redux";
import authReducer from "./login/authReducer";
import { branchListReducer, branchReducer } from "./Branch/BranchReducer";
import {  createAccountReducer, deleteAccountReducer, getAccountsReducer, updateAccountReducer } from "./create/createNewAccount/NewAccountReducer";

import { branchCreateReducer } from "./createBranchAndManager/branchReducer";
import { adminCreateReducer } from "./Admin/adminReducer";
import { managerCreateReducer } from "./Manger/MangerReducer";
import {
  machineTypeCreateReducer,
  machineTypeListReducer,
} from "./create/machineType/machineTypeReducer";
import {
  machineCreateReducer,
  machineDeleteReducer,
  machineDetailReducer,
  machineListReducer,
  machineUpdateReducer,
} from "./create/machine/MachineReducer";

import { operatorCreateReducer, operatorDeleteReducer, operatorListReducer, operatorUpdateReducer } from "./create/CreateMachineOpertor/MachineOpertorReducer";
import { productCategoryReducer, productTypeWithProductsReducer } from "./create/products/productCategories/productCategoriesReducer";
import { materialCategoryReducer } from "./create/Materials/MaterialsCategories/MaterialsCategoriesReducer";
import { materialCreateReducer } from "./create/Materials/MaterialReducer";
import { stepCreateReducer, stepListReducer, stepUpdateReducer } from "./create/CreateStep/StepReducer";




const rootReducer = combineReducers({
  auth: authReducer,
  branches: branchReducer,
  // account: accountReducer,
  createAccount: createAccountReducer,
  getAccounts: getAccountsReducer,
  updateAccount: updateAccountReducer,
  deleteAccount: deleteAccountReducer,

  branchCreate: branchCreateReducer,
  branchList: branchListReducer,
  adminCreate: adminCreateReducer,
  managerCreate: managerCreateReducer,

  machineTypeCreate: machineTypeCreateReducer,
  machineTypeList: machineTypeListReducer,

  machineCreate: machineCreateReducer,
  machineDetail: machineDetailReducer,
  machineList: machineListReducer,


  stepCreate: stepCreateReducer,
  stepList: stepListReducer,
  stepUpdate: stepUpdateReducer,
  // stepDelete: stepDeleteReducer,



  operatorCreate: operatorCreateReducer,
  operatorList: operatorListReducer,
  operatorUpdate: operatorUpdateReducer,
  operatorDelete: operatorDeleteReducer,

  productCategories: productCategoryReducer,
  materialCategories: materialCategoryReducer,
  materialCreate:materialCreateReducer, 

  productTypeWithProductsReducer: productTypeWithProductsReducer,



  machineUpdate: machineUpdateReducer,
  machineDelete: machineDeleteReducer,
 
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;