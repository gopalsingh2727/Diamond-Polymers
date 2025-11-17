// rootReducer.ts - Root Reducer combining all reducers
import { combineReducers } from 'redux';
import reportReducer from './reports/reportReducer';
import orderReducer from './orders/orderReducer';
import { branchReducer } from './branches/branchReducer';

// If you have auth reducer from your order management system
// import authReducer from './auth/authReducer';

const rootReducer = combineReducers({
  reports: reportReducer,
  orders: orderReducer,
  branches: branchReducer,
  // Add your other reducers here
  // auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
