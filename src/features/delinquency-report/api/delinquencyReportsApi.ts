import baseApi from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";
import type {
  DelinquencyMutationResult,
  DelinquencyReport,
  DelinquencyReportPayload,
} from "../types";

export const delinquencyReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDelinquencyPeriods: builder.query<string[], string>({
      query: (associationId) => ({
        url: "/delinquency-reports/periods",
        params: { association_id: associationId },
      }),
      transformResponse: (response: unknown) => unwrapApiData<string[]>(response),
      providesTags: (_result, _error, associationId) => [
        { type: "DelinquencyReports", id: associationId },
      ],
    }),
    getDelinquencyReport: builder.query<
      DelinquencyReport | null,
      {
        associationId: string;
        fiscalPeriod?: string;
        block?: string;
        search?: string;
      }
    >({
      query: ({ associationId, fiscalPeriod, block, search }) => ({
        url: "/delinquency-reports",
        params: {
          association_id: associationId,
          fiscal_period: fiscalPeriod,
          block,
          search,
        },
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<DelinquencyReport | null>(response),
      providesTags: (_result, _error, { associationId }) => [
        { type: "DelinquencyReports", id: associationId },
      ],
    }),
    createDelinquencyReport: builder.mutation<
      DelinquencyMutationResult,
      DelinquencyReportPayload
    >({
      query: (data) => ({ url: "/delinquency-reports", method: "POST", data }),
      transformResponse: (response: unknown) =>
        unwrapApiData<DelinquencyMutationResult>(response),
      invalidatesTags: (_result, _error, data) => [
        { type: "DelinquencyReports", id: data.association_id },
      ],
    }),
    updateDelinquencyReport: builder.mutation<
      DelinquencyMutationResult,
      { id: string; data: DelinquencyReportPayload }
    >({
      query: ({ id, data }) => ({
        url: `/delinquency-reports/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<DelinquencyMutationResult>(response),
      invalidatesTags: (_result, _error, { data }) => [
        { type: "DelinquencyReports", id: data.association_id },
      ],
    }),
    importDelinquencyReport: builder.mutation<
      DelinquencyMutationResult,
      { associationId: string; fiscalPeriod: string; file: File }
    >({
      query: ({ associationId, fiscalPeriod, file }) => {
        const data = new FormData();
        data.append("file", file);
        return {
          url: "/delinquency-reports/import",
          method: "POST",
          params: {
            association_id: associationId,
            fiscal_period: fiscalPeriod,
          },
          data,
        };
      },
      transformResponse: (response: unknown) =>
        unwrapApiData<DelinquencyMutationResult>(response),
      invalidatesTags: (_result, _error, { associationId }) => [
        { type: "DelinquencyReports", id: associationId },
      ],
    }),
  }),
});

export const {
  useGetDelinquencyPeriodsQuery,
  useGetDelinquencyReportQuery,
  useCreateDelinquencyReportMutation,
  useUpdateDelinquencyReportMutation,
  useImportDelinquencyReportMutation,
} = delinquencyReportsApi;
