import { legacy_createStore as createStore, applyMiddleware, compose } from "redux";
import * as thunkModule from "redux-thunk";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage for web
import rootReducer from "./componest/redux/rootReducer";
import type { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import websocketMiddleware from "./componest/redux/websocket/websocketMiddleware";

const thunk = thunkModule.thunk;

// ✅ Redux Persist Configuration
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["orders", "dataCache"], // ✅ Persist orders and dataCache to localStorage
  blacklist: ["auth", "websocket"], // Don't persist auth (has sensitive token) and websocket (transient)
  writeFailHandler: (err: Error) => {

  }
};

// ✅ Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Middleware to track WebSocket actions for debugging
const websocketActionLogger = (store: any) => (next: any) => (action: any) => {
  // Log WebSocket actions
  if (action.type && action.type.includes('ViaWS')) {

  }

  // Log persist actions
  if (action.type && action.type.startsWith('persist/')) {

  }

  return next(action);
};

// ✅ Create store with Redux DevTools support
const composeEnhancers =
typeof window !== 'undefined' &&
(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ||
compose;

const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk, websocketActionLogger, websocketMiddleware))
);

// ✅ Create persistor with immediate flush
export const persistor = persistStore(store, null, () => {

});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// ✅ Expose store to window for debugging (development only)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).store = store;
  (window as any).persistor = persistor;


}

export default store;