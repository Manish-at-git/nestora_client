import baseApi from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";
import type {
  PrepaidReport,
  PrepaidReportMutationResult,
  PrepaidReportPayload,
} from "../types";

export const prepaidReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrepaidReportPeriods: builder.query<string[], string>({
      query: (associationId) => ({
        url: "/prepaid-reports/periods",
        params: { association_id: associationId },
      }),
      transformResponse: (response: unknown) => unwrapApiData<string[]>(response),
      providesTags: (_result, _error, associationId) => [
        { type: "PrepaidReports", id: associationId },
      ],
    }),
    getPrepaidReport: builder.query<
      PrepaidReport | null,
      { associationId: string; fiscalPeriod?: string; block?: string }
    >({
      query: ({ associationId, fiscalPeriod, block }) => ({
        url: "/prepaid-reports",
        params: {
          association_id: associationId,
          fiscal_period: fiscalPeriod,
          block: block || undefined,
        },
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<PrepaidReport | null>(response),
      providesTags: (_result, _error, { associationId }) => [
        { type: "PrepaidReports", id: associationId },
      ],
    }),
    createPrepaidReport: builder.mutation<
      PrepaidReportMutationResult,
      PrepaidReportPayload
    >({
      query: (data) => ({ url: "/prepaid-reports", method: "POST", data }),
      transformResponse: (response: unknown) =>
        unwrapApiData<PrepaidReportMutationResult>(response),
      invalidatesTags: (_result, _error, data) => [
        { type: "PrepaidReports", id: data.association_id },
      ],
    }),
    updatePrepaidReport: builder.mutation<
      PrepaidReportMutationResult,
      { id: string; data: PrepaidReportPayload }
    >({
      query: ({ id, data }) => ({
        url: `/prepaid-reports/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<PrepaidReportMutationResult>(response),
      invalidatesTags: (_result, _error, { data }) => [
        { type: "PrepaidReports", id: data.association_id },
      ],
    }),
    importPrepaidReport: builder.mutation<
      PrepaidReportMutationResult,
      { associationId: string; fiscalPeriod: string; file: File }
    >({
      query: ({ associationId, fiscalPeriod, file }) => {
        const data = new FormData();
        data.append("file", file);
        return {
          url: "/prepaid-reports/import",
          method: "POST",
          params: {
            association_id: associationId,
            fiscal_period: fiscalPeriod,
          },
          data,
        };
      },
      transformResponse: (response: unknown) =>
        unwrapApiData<PrepaidReportMutationResult>(response),
      invalidatesTags: (_result, _error, { associationId }) => [
        { type: "PrepaidReports", id: associationId },
      ],
    }),
  }),
});

export const {
  useGetPrepaidReportPeriodsQuery,
  useGetPrepaidReportQuery,
  useCreatePrepaidReportMutation,
  useUpdatePrepaidReportMutation,
  useImportPrepaidReportMutation,
} = prepaidReportsApi;
