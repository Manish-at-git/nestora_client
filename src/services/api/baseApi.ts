import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import apiClient from "./apiClient";
import type { ApiErrorDetail } from "@/types/api";

interface BaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
}

interface CustomError {
  status?: number;
  data?: ApiErrorDetail | string;
}

// Axios-based Base Query for RTK Query
const axiosBaseQuery =
  (): BaseQueryFn<BaseQueryArgs, unknown, CustomError> =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      const result = await apiClient({
        url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError<{ detail?: ApiErrorDetail; message?: string }>;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data?.message || err.response?.data?.detail || err.message,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Auth",
    "Announcements",
    "ServiceRequests",
    "Associations",
    "Visitors",
    "Deliveries",
    "Staff",
    "Vehicles",
    "Meetings",
    "Events",
    "Polls",
    "Documents",
    "UnitDocuments",
    "Financials",
    "Amenities",
    "Marketplace",
    "Incidents",
    "BoardTasks",
    "Committees",
    "CommitteeMembers",
    "UserProfile",
    "Wallet",
    "EntityTypes",
    "Entities",
    "Roles",
    "Features",
    "Permissions",
    "SubscriptionPlans",
    "Employees",
    "Users",
    "Vendors",
    "Bank",
    "Locations",
  ],
  endpoints: () => ({}),
});

export default baseApi;
