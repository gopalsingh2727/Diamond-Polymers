import { legacy_createStore as createStore, applyMiddleware } from "redux";
import * as thunkModule from "redux-thunk";
import rootReducer from "./componest/redux/rootReducer";
import type { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";


const thunk = thunkModule.thunk;

const store = createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

export default store;