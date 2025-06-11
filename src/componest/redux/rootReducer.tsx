// components/redux/rootReducer.ts
import { combineReducers } from "redux";
import authReducer from "./login/authReducer";
import { branchListReducer, branchReducer } from "./Branch/BranchReducer";
import { accountReducer } from "./create/createNewAccount/NewAccountReducer";

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
import { stepCreateReducer } from "./create/CreateStep/StepReducer";
import { operatorCreateReducer } from "./create/CreateMachineOpertor/MachineOpertorReducer";
import { productCategoryReducer, productTypeWithProductsReducer } from "./create/products/productCategories/productCategoriesReducer";
import { materialCategoryReducer } from "./create/Materials/MaterialsCategories/MaterialsCategoriesReducer";
import { materialCreateReducer } from "./create/Materials/MaterialReducer";


const rootReducer = combineReducers({
  auth: authReducer,
  branches: branchReducer,
  account: accountReducer,

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
  operatorCreate: operatorCreateReducer,

  productCategories: productCategoryReducer,
  materialCategories: materialCategoryReducer,
  materialCreate:materialCreateReducer, 

  productTypeWithProductsReducer: productTypeWithProductsReducer,



  machineUpdate: machineUpdateReducer,
  machineDelete: machineDeleteReducer,
 
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;