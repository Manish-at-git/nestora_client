import baseApi from "@/services/api/baseApi";
import type { ChartOfAccount } from "../types";

export const chartOfAccountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChartOfAccounts: builder.query<ChartOfAccount[], void>({
      query: () => ({
        url: "/admin/global-coa",
        method: "GET",
      }),
      transformResponse: (
        response: ChartOfAccount[] | { data?: ChartOfAccount[]; coa?: ChartOfAccount[] },
      ) => (Array.isArray(response) ? response : response.data || response.coa || []),
      providesTags: ["Financials"],
    }),
    uploadChartOfAccounts: builder.mutation<
      { ok: boolean; message: string },
      FormData
    >({
      query: (data) => ({
        url: "/admin/global-coa/upload",
        method: "POST",
        data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["Financials"],
    }),
  }),
});

export const { useGetChartOfAccountsQuery, useUploadChartOfAccountsMutation } = chartOfAccountsApi;
