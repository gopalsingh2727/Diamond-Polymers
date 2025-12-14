// components/redux/rootReducer.ts
import { combineReducers } from "redux";
import { LOGOUT } from "./login/authConstants";
// Auth
import authReducer from "./login/authReducer";

// Branch
import { branchListReducer, branchReducer } from "./Branch/BranchReducer";
import { branchCreateReducer } from "./createBranchAndManager/branchReducer";





// Admin & Manager
import {
  adminCreateReducer,
  adminListReducer,
  adminUpdateReducer,
  adminDeleteReducer,
} from "./Admin/adminReducer";
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

// Customer Category
import {
  createCustomerCategoryReducer,
  getCustomerCategoriesReducer,
  updateCustomerCategoryReducer,
  deleteCustomerCategoryReducer,
} from "./create/customerCategory/CustomerCategoryReducer";

// Customer Parent Company
import {
  createCustomerParentCompanyReducer,
  getCustomerParentCompaniesReducer,
  updateCustomerParentCompanyReducer,
  deleteCustomerParentCompanyReducer,
} from "./create/customerParentCompany/CustomerParentCompanyReducer";

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

// Steps
import {
  stepCreateReducer,
  stepDeleteReducer,
  stepListReducer,
  stepUpdateReducer,
  // If you have a delete reducer, import and include it
  // stepDeleteReducer,
} from "./create/CreateStep/StepReducer";

// NEW: Option System (replaces Product/Material/Printing)
import optionTypeReducer from "./option/optionTypeReducer";
import optionReducer from "./option/optionReducer";
import optionSpecReducer from "./create/optionSpec/optionSpecReducer";

// Category
import categoryReducer from "./category/categoryReducer";

// Order Type
import {
  orderTypeListReducer,
  orderTypeDetailReducer,
  defaultOrderTypeReducer,
  orderTypeCreateReducer
} from "./create/orderType/orderTypeReducer";

// Print Type
import {
  printTypeListReducer,
  printTypeDetailReducer,
  defaultPrintTypeReducer,
  printTypeCreateReducer
} from "./create/printType/printTypeReducer";

// Excel Export Type
import {
  excelExportTypeListReducer,
  excelExportTypeDetailReducer,
  defaultExcelExportTypeReducer,
  excelExportTypeCreateReducer
} from "./create/excelExportType/excelExportTypeReducer";

// Report Type
import {
  reportTypeListReducer,
  reportTypeDetailReducer,
  defaultReportTypeReducer,
  reportTypeCreateReducer,
  reportTypeUpdateReducer,
  reportTypeDeleteReducer,
  generatedReportReducer
} from "./create/reportType/reportTypeReducer";

// Machine Template
import machineTemplateReducer from "./machineTemplate/machineTemplateReducer";

// Operator View
import operatorViewReducer from "./operatorView/operatorViewReducer";

import deviceAccessReducer from "./deviceAccess/deviceAccessReducers";
import orderReducer, { accountOrdersReducer } from "./oders/orderReducers";
import orderFormDataReducer from "./oders/orderFormDataReducer";
import machineTableReducer from "./machineTable/machineTableReducer";
// import { getMaterialCategoriesReducer } from "./create/Materials/MaterialsCategories/MaterialsCategoriesActions";

// ✅ Universal Data Cache
import { dataCacheReducer } from "./cache/dataCacheReducer";

// Chat Agent
import chatReducer from "./chat/chatSlice";

// WebSocket
import websocketReducer from "./websocket/websocketSlice";

// Reports Dashboard
import reportReducer from "./reports/reportReducer";
import reportGroupReducer from "./reportGroups/reportGroupReducer";

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

  // Customer Category
  createCustomerCategory: createCustomerCategoryReducer,
  getCustomerCategories: getCustomerCategoriesReducer,
  updateCustomerCategory: updateCustomerCategoryReducer,
  deleteCustomerCategory: deleteCustomerCategoryReducer,

  // Customer Parent Company
  createCustomerParentCompany: createCustomerParentCompanyReducer,
  getCustomerParentCompanies: getCustomerParentCompaniesReducer,
  updateCustomerParentCompany: updateCustomerParentCompanyReducer,
  deleteCustomerParentCompany: deleteCustomerParentCompanyReducer,

  // Admin & Manager
  adminCreate: adminCreateReducer,
  adminList: adminListReducer,
  adminUpdate: adminUpdateReducer,
  adminDelete: adminDeleteReducer,
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

  // Steps
  stepCreate: stepCreateReducer,
  stepList: stepListReducer,
  stepUpdate: stepUpdateReducer,
  stepDelete: stepDeleteReducer,

  // NEW: Option System (unified product/material/printing)
  optionType: optionTypeReducer,
  option: optionReducer,
  optionSpec: optionSpecReducer,

  // Category
  category: categoryReducer,

  // Order Type
  orderTypeList: orderTypeListReducer,
  orderTypeDetail: orderTypeDetailReducer,
  defaultOrderType: defaultOrderTypeReducer,
  orderTypeCreate: orderTypeCreateReducer,

  // Print Type
  printTypeList: printTypeListReducer,
  printTypeDetail: printTypeDetailReducer,
  defaultPrintType: defaultPrintTypeReducer,
  printTypeCreate: printTypeCreateReducer,

  // Excel Export Type
  excelExportTypeList: excelExportTypeListReducer,
  excelExportTypeDetail: excelExportTypeDetailReducer,
  defaultExcelExportType: defaultExcelExportTypeReducer,
  excelExportTypeCreate: excelExportTypeCreateReducer,

  // Report Type (Report Builder)
  reportTypeList: reportTypeListReducer,
  reportTypeDetail: reportTypeDetailReducer,
  defaultReportType: defaultReportTypeReducer,
  reportTypeCreate: reportTypeCreateReducer,
  reportTypeUpdate: reportTypeUpdateReducer,
  reportTypeDelete: reportTypeDeleteReducer,
  generatedReport: generatedReportReducer,

  // Machine Template
  machineTemplate: machineTemplateReducer,

  // Operator View
  operatorView: operatorViewReducer,

  //machineTable
  machineTable: machineTableReducer,

  // Orders (includes list, form, and machineTable sub-reducers)
  orders: orderReducer,
  accountOrders: accountOrdersReducer,
  orderFormData: orderFormDataReducer, // Single API call for all order form data

  //device Access create
  deviceAccess: deviceAccessReducer,

  // Chat Agent
  chat: chatReducer,

  // WebSocket
  websocket: websocketReducer,

  // Reports Dashboard
  reports: reportReducer,
  reportGroups: reportGroupReducer,

});

const rootReducer = (state: any, action: any) => {
  if (action.type === LOGOUT) {
    state = undefined;
  }
  return appReducer(state, action);
};





export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;