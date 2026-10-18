import baseApi from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";
import type { IncomeStatement, IncomeStatementMutationResult, IncomeStatementPayload } from "../types";

export const incomeStatementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeStatementPeriods: builder.query<string[], string>({
      query: (associationId) => ({ url: "/income-statements/periods", params: { association_id: associationId } }),
      transformResponse: (response: unknown) => unwrapApiData<string[]>(response),
      providesTags: (_result, _error, associationId) => [{ type: "IncomeStatements", id: associationId }],
    }),
    getIncomeStatement: builder.query<IncomeStatement | null, { associationId: string; fiscalPeriod?: string }>({
      query: ({ associationId, fiscalPeriod }) => ({ url: "/income-statements", params: { association_id: associationId, fiscal_period: fiscalPeriod } }),
      transformResponse: (response: unknown) => unwrapApiData<IncomeStatement | null>(response),
      providesTags: (_result, _error, { associationId }) => [{ type: "IncomeStatements", id: associationId }],
    }),
    createIncomeStatement: builder.mutation<IncomeStatementMutationResult, IncomeStatementPayload>({
      query: (data) => ({ url: "/income-statements", method: "POST", data }),
      transformResponse: (response: unknown) => unwrapApiData<IncomeStatementMutationResult>(response),
      invalidatesTags: (_result, _error, data) => [{ type: "IncomeStatements", id: data.association_id }],
    }),
    updateIncomeStatement: builder.mutation<IncomeStatementMutationResult, { id: string; data: IncomeStatementPayload }>({
      query: ({ id, data }) => ({ url: `/income-statements/${id}`, method: "PUT", data }),
      transformResponse: (response: unknown) => unwrapApiData<IncomeStatementMutationResult>(response),
      invalidatesTags: (_result, _error, { data }) => [{ type: "IncomeStatements", id: data.association_id }],
    }),
    importIncomeStatement: builder.mutation<IncomeStatementMutationResult, { associationId: string; fiscalPeriod: string; file: File }>({
      query: ({ associationId, fiscalPeriod, file }) => {
        const data = new FormData();
        data.append("file", file);
        return { url: "/income-statements/import", method: "POST", params: { association_id: associationId, fiscal_period: fiscalPeriod }, data };
      },
      transformResponse: (response: unknown) => unwrapApiData<IncomeStatementMutationResult>(response),
      invalidatesTags: (_result, _error, { associationId }) => [{ type: "IncomeStatements", id: associationId }],
    }),
  }),
});

export const { useGetIncomeStatementPeriodsQuery, useGetIncomeStatementQuery, useCreateIncomeStatementMutation, useUpdateIncomeStatementMutation, useImportIncomeStatementMutation } = incomeStatementsApi;
