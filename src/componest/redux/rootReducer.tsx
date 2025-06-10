// componest/redux/rootReducer.ts
import { combineReducers } from "redux";
import authReducer from "./login/authReducer";
import { branchListReducer, branchReducer } from "./Branch/BranchReducer";
import { accountReducer } from "./create/createNewAccount/NewAccountReducer";
import { productCategoryReducer } from "./create/products/ProductReducer";
import { branchCreateReducer } from "./createBranchAndManager/branchReducer";
import { adminCreateReducer } from "./Admin/adminReducer";
import { managerCreateReducer } from "./Manger/MangerReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  branches: branchReducer,
  account:accountReducer,
  productCategoryReducer:productCategoryReducer,
  branchCreate: branchCreateReducer,
  branchList: branchListReducer,
  adminCreate: adminCreateReducer,
  managerCreateReducer:managerCreateReducer,

  
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;