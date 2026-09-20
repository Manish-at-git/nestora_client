import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  BankAccount,
  BankAccountCreatePayload,
  BankAccountUpdatePayload,
} from "../types";

interface BankMutationResult {
  ok: boolean;
  id?: string;
  message?: string;
}

export const bankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccounts: builder.query<BankAccount[], { associationId?: string } | void>({
      query: (params) => ({
        url: "/admin/bank-accounts",
        method: "GET",
        params: params?.associationId ? { association_id: params.associationId } : undefined,
      }),
      transformResponse: (response: unknown) => unwrapApiList<BankAccount>(response),
      providesTags: ["Bank"],
    }),

    createBankAccount: builder.mutation<
      BankMutationResult,
      BankAccountCreatePayload
    >({
      query: (data) => ({
        url: "/admin/bank-accounts",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<BankMutationResult>(response),
      invalidatesTags: ["Bank"],
    }),

    updateBankAccount: builder.mutation<
      BankMutationResult,
      { accountId: string; data: BankAccountUpdatePayload }
    >({
      query: ({ accountId, data }) => ({
        url: `/admin/bank-accounts/${accountId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<BankMutationResult>(response),
      invalidatesTags: ["Bank"],
    }),

    deleteBankAccount: builder.mutation<
      BankMutationResult,
      string
    >({
      query: (accountId) => ({
        url: `/admin/bank-accounts/${accountId}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrapApiData<BankMutationResult>(response),
      invalidatesTags: ["Bank"],
    }),
  }),
});

export const {
  useGetBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} = bankApi;
