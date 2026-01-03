// components/redux/rootReducer.ts
import { combineReducers } from "redux";
import { LOGOUT, CLEAR_BRANCH_DATA } from "./login/authConstants";
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

// ==========================================
// UNIFIED V2 REDUCER (replaces individual entity reducers)
// ==========================================
import unifiedV2Reducer from "./unifiedV2/unifiedV2Reducer";

// Machine Template
import machineTemplateReducer from "./machineTemplate/machineTemplateReducer";

// Operator View
import operatorViewReducer from "./operatorView/operatorViewReducer";

// Orders
import orderReducer, { accountOrdersReducer } from "./oders/orderReducers";
import orderFormDataReducer from "./oders/orderFormDataReducer";
import machineTableReducer from "./machineTable/machineTableReducer";

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

  // Admin & Manager
  adminCreate: adminCreateReducer,
  adminList: adminListReducer,
  adminUpdate: adminUpdateReducer,
  adminDelete: adminDeleteReducer,
  managerCreate: managerCreateReducer,
  managerList: managerListReducer,
  managerUpdate: managerUpdateReducer,
  managerDelete: managerDeleteReducer,

  // ==========================================
  // UNIFIED V2 (all entities in one reducer)
  // Includes: account, customerCategory, parentCompany,
  // machineType, machine, step, operator, deviceAccess,
  // category, optionType, optionSpec, option, orderType,
  // printType, excelExportType, reportType, template
  // ==========================================
  v2: unifiedV2Reducer,

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

  // Clear all branch-specific data when branch changes
  if (action.type === CLEAR_BRANCH_DATA) {
    // Keep auth, but clear everything else
    // ⚠️ CRITICAL: Return empty objects instead of undefined to prevent reducers
    // from falling back to stale initialState
    const { auth } = state;
    state = {
      auth,
      // Reset all other states to empty (NOT undefined)
      dataCache: undefined,
      orderFormData: {
        loading: false,
        error: null,
        data: null,
        lastFetched: null
      },
      v2: undefined,
      machineTable: undefined,
      orders: undefined,
      accountOrders: undefined,
      reports: undefined,
      reportGroups: undefined,
      branches: state.branches, // Keep branches list
      branchList: state.branchList, // Keep branch list
    };
  }

  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
