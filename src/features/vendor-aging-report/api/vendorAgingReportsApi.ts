import baseApi from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";
import type {
  VendorAgingMutationResult,
  VendorAgingReport,
  VendorAgingReportPayload,
} from "../types";

export const vendorAgingReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendorAgingPeriods: builder.query<string[], string>({
      query: (associationId) => ({
        url: "/vendor-aging-reports/periods",
        params: { association_id: associationId },
      }),
      transformResponse: (response: unknown) => unwrapApiData<string[]>(response),
      providesTags: (_result, _error, associationId) => [
        { type: "VendorAgingReports", id: associationId },
      ],
    }),
    getVendorAgingReport: builder.query<
      VendorAgingReport | null,
      { associationId: string; fiscalPeriod?: string; category?: string; search?: string }
    >({
      query: ({ associationId, fiscalPeriod, category, search }) => ({
        url: "/vendor-aging-reports",
        params: {
          association_id: associationId,
          fiscal_period: fiscalPeriod,
          category: category || undefined,
          search: search || undefined,
        },
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<VendorAgingReport | null>(response),
      providesTags: (_result, _error, { associationId }) => [
        { type: "VendorAgingReports", id: associationId },
      ],
    }),
    createVendorAgingReport: builder.mutation<
      VendorAgingMutationResult,
      VendorAgingReportPayload
    >({
      query: (data) => ({ url: "/vendor-aging-reports", method: "POST", data }),
      transformResponse: (response: unknown) =>
        unwrapApiData<VendorAgingMutationResult>(response),
      invalidatesTags: (_result, _error, data) => [
        { type: "VendorAgingReports", id: data.association_id },
      ],
    }),
    updateVendorAgingReport: builder.mutation<
      VendorAgingMutationResult,
      { id: string; data: VendorAgingReportPayload }
    >({
      query: ({ id, data }) => ({
        url: `/vendor-aging-reports/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<VendorAgingMutationResult>(response),
      invalidatesTags: (_result, _error, { data }) => [
        { type: "VendorAgingReports", id: data.association_id },
      ],
    }),
    importVendorAgingReport: builder.mutation<
      VendorAgingMutationResult,
      { associationId: string; fiscalPeriod: string; file: File }
    >({
      query: ({ associationId, fiscalPeriod, file }) => {
        const data = new FormData();
        data.append("file", file);
        return {
          url: "/vendor-aging-reports/import",
          method: "POST",
          params: {
            association_id: associationId,
            fiscal_period: fiscalPeriod,
          },
          data,
        };
      },
      transformResponse: (response: unknown) =>
        unwrapApiData<VendorAgingMutationResult>(response),
      invalidatesTags: (_result, _error, { associationId }) => [
        { type: "VendorAgingReports", id: associationId },
      ],
    }),
  }),
});

export const {
  useGetVendorAgingPeriodsQuery,
  useGetVendorAgingReportQuery,
  useCreateVendorAgingReportMutation,
  useUpdateVendorAgingReportMutation,
  useImportVendorAgingReportMutation,
} = vendorAgingReportsApi;
