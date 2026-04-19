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

// ✅ GraphQL Orders (read-only, POST /graphql)
import graphqlOrdersReducer from "./graphql/graphqlOrderReducer";

// ✅ Universal Data Cache
import { dataCacheReducer } from "./cache/dataCacheReducer";

// Chat Agent
import chatReducer from "./chat/chatSlice";

// WebSocket
import websocketReducer from "./websocket/websocketSlice";

import reportGroupReducer from "./reportGroups/reportGroupReducer";

// Order Forwarding
import orderForwardReducer from "./orderforward/orderForwardReducer";

// P2P Chat
import p2pChatReducer from "./p2pChat/p2pChatSlice";

// Contacts
import contactsReducer from "./contacts/contactsSlice";
import dashboardTypeReducer from "./dashbroadtype/dashboardTypeReducer";
import dashboardReportDataReducer from "./dashbroadData/dashboardreportdatareducer";

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
  dashboardType: dashboardTypeReducer,

  // ==========================================
  // UNIFIED V2 (all entities in one reducer)
  // ==========================================
  v2: unifiedV2Reducer,

  // Machine Template
  machineTemplate: machineTemplateReducer,

  // Operator View
  operatorView: operatorViewReducer,

  // Machine Table
  machineTable: machineTableReducer,

  // Orders (REST — list, form, machineTable)
  orders: orderReducer,
  accountOrders: accountOrdersReducer,
  orderFormData: orderFormDataReducer,

  // ✅ GraphQL Orders (POST /graphql — read-only, used by window.x + templates)
  graphqlOrders: graphqlOrdersReducer,

  // Chat Agent
  chat: chatReducer,

  // WebSocket
  websocket: websocketReducer,

  // Reports Dashboard
  DashboardData: dashboardReportDataReducer,
  reportGroups: reportGroupReducer,

  // Order Forwarding
  orderForward: orderForwardReducer,

  // P2P Chat
  p2pChat: p2pChatReducer,

  // Contacts
  contacts: contactsReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === LOGOUT) {
    state = undefined;
  }

  // Clear all branch-specific data when branch changes
  if (action.type === CLEAR_BRANCH_DATA) {
    const { auth } = state;
    state = {
      auth,
      dataCache:     undefined,
      orderFormData: { loading: false, error: null, data: null, lastFetched: null },
      v2:            undefined,
      machineTable:  undefined,
      orders:        undefined,
      accountOrders: undefined,
      graphqlOrders: undefined,   // ← clear on branch switch
      reports:       undefined,
      reportGroups:  undefined,
      branches:      state.branches,
      branchList:    state.branchList,
    };
  }

  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;