import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "@/services/api/baseApi";
import uiReducer from "./uiSlice";

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  ui: uiReducer,
  // Feature domain reducers will be attached here incrementally
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
