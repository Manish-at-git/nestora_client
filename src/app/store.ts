import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@/services/api/baseApi";
import rootReducer from "./rootReducer";

const isDev = import.meta.env.DEV || import.meta.env.MODE !== "production";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
  devTools: isDev
    ? {
        name: "Nestora App",
        trace: true,
        traceLimit: 25,
      }
    : false,
});

// Enable listener behavior for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Expose store globally in development mode for easy debugging in browser console
if (isDev && typeof window !== "undefined") {
  (window as any).__store = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
