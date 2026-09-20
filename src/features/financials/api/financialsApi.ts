import baseApi from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  FinancialReport,
  FinancialReportCreatePayload,
} from "../types";

export const financialsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialReports: builder.query<FinancialReport[], void>({
      query: () => ({
        url: "/admin/financial-reports",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<FinancialReport>(response),
      providesTags: ["Financials"],
    }),

    createFinancialReport: builder.mutation<
      { ok: boolean; id: string; message: string },
      FinancialReportCreatePayload
    >({
      query: (data) => ({
        url: "/admin/financial-reports",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; id?: string; message?: string }>(response),
      invalidatesTags: ["Financials"],
    }),
  }),
});

export const {
  useGetFinancialReportsQuery,
  useCreateFinancialReportMutation,
} = financialsApi;
