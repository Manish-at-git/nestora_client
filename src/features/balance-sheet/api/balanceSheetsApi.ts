import baseApi from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";
import type {
  BalanceSheet,
  BalanceSheetMutationResult,
  BalanceSheetPayload,
} from "../types";

interface BalanceSheetQuery {
  associationId: string;
  asOnDate?: string;
}

interface BalanceSheetImport {
  associationId: string;
  asOnDate: string;
  file: File;
}

export const balanceSheetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBalanceSheetDates: builder.query<string[], string>({
      query: (associationId) => ({
        url: "/balance-sheets/dates",
        method: "GET",
        params: { association_id: associationId },
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<string[]>(response),
      providesTags: (_result, _error, associationId) => [
        { type: "BalanceSheets", id: associationId },
      ],
    }),

    getBalanceSheet: builder.query<BalanceSheet | null, BalanceSheetQuery>({
      query: ({ associationId, asOnDate }) => ({
        url: "/balance-sheets",
        method: "GET",
        params: {
          association_id: associationId,
          as_on_date: asOnDate,
        },
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<BalanceSheet | null>(response),
      providesTags: (_result, _error, { associationId }) => [
        { type: "BalanceSheets", id: associationId },
      ],
    }),

    createBalanceSheet: builder.mutation<
      BalanceSheetMutationResult,
      BalanceSheetPayload
    >({
      query: (data) => ({
        url: "/balance-sheets",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<BalanceSheetMutationResult>(response),
      invalidatesTags: (_result, _error, data) => [
        { type: "BalanceSheets", id: data.association_id },
      ],
    }),

    updateBalanceSheet: builder.mutation<
      BalanceSheetMutationResult,
      { id: string; data: BalanceSheetPayload }
    >({
      query: ({ id, data }) => ({
        url: `/balance-sheets/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<BalanceSheetMutationResult>(response),
      invalidatesTags: (_result, _error, { data }) => [
        { type: "BalanceSheets", id: data.association_id },
      ],
    }),

    importBalanceSheet: builder.mutation<
      BalanceSheetMutationResult,
      BalanceSheetImport
    >({
      query: ({ associationId, asOnDate, file }) => {
        const data = new FormData();
        data.append("file", file);
        return {
          url: "/balance-sheets/import",
          method: "POST",
          params: {
            association_id: associationId,
            as_on_date: asOnDate,
          },
          data,
        };
      },
      transformResponse: (response: unknown) =>
        unwrapApiData<BalanceSheetMutationResult>(response),
      invalidatesTags: (_result, _error, { associationId }) => [
        { type: "BalanceSheets", id: associationId },
      ],
    }),
  }),
});

export const {
  useGetBalanceSheetDatesQuery,
  useGetBalanceSheetQuery,
  useCreateBalanceSheetMutation,
  useUpdateBalanceSheetMutation,
  useImportBalanceSheetMutation,
} = balanceSheetsApi;
