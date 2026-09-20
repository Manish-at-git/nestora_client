import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";
import type {
  Wallet,
  WalletTransaction,
  AddMoneyPayload,
  SendMoneyPayload,
  SetupPinPayload,
  PayDuesPayload,
  PayDuesUpiPayload,
  CreateOrderPayload,
  VerifyPaymentPayload,
} from "../types";

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<Wallet, void>({
      query: () => ({
        url: "/wallet",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        return unwrapApiData<Wallet>(response);
      },
      providesTags: [{ type: "Wallet", id: "DETAILS" }],
    }),

    getTransactions: builder.query<WalletTransaction[], void>({
      query: () => ({
        url: "/wallet/transactions",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        return unwrapApiData<WalletTransaction[]>(response) || [];
      },
      providesTags: [{ type: "Wallet", id: "TRANSACTIONS" }],
    }),

    setupPin: builder.mutation<{ ok: boolean; message?: string }, SetupPinPayload>({
      query: (body) => ({
        url: "/wallet/pin",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean; message?: string }>(response as any),
      invalidatesTags: [{ type: "Wallet", id: "DETAILS" }],
    }),

    addMoney: builder.mutation<{ ok: boolean; message?: string }, AddMoneyPayload>({
      query: (body) => ({
        url: "/wallet/add-money",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean; message?: string }>(response as any),
      invalidatesTags: [
        { type: "Wallet", id: "DETAILS" },
        { type: "Wallet", id: "TRANSACTIONS" },
      ],
    }),

    sendMoney: builder.mutation<{ ok: boolean; message?: string }, SendMoneyPayload>({
      query: (body) => ({
        url: "/wallet/send",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean; message?: string }>(response as any),
      invalidatesTags: [
        { type: "Wallet", id: "DETAILS" },
        { type: "Wallet", id: "TRANSACTIONS" },
      ],
    }),

    payDues: builder.mutation<{ ok: boolean; message?: string }, PayDuesPayload>({
      query: (body) => ({
        url: "/wallet/pay-dues",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean; message?: string }>(response as any),
      invalidatesTags: [
        { type: "Wallet", id: "DETAILS" },
        { type: "Wallet", id: "TRANSACTIONS" },
        { type: "Financials" },
      ],
    }),

    payDuesUPI: builder.mutation<{ ok: boolean; message?: string }, PayDuesUpiPayload>({
      query: (body) => ({
        url: "/wallet/pay-dues-upi",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean; message?: string }>(response as any),
      invalidatesTags: [
        { type: "Wallet", id: "DETAILS" },
        { type: "Wallet", id: "TRANSACTIONS" },
        { type: "Financials" },
      ],
    }),

    createRazorpayOrder: builder.mutation<any, CreateOrderPayload>({
      query: (body) => ({
        url: "/create-order",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapApiData<any>(response as any),
    }),

    verifyRazorpayPayment: builder.mutation<any, VerifyPaymentPayload>({
      query: (body) => ({
        url: "/verify-payment",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapApiData<any>(response as any),
      invalidatesTags: [
        { type: "Wallet", id: "DETAILS" },
        { type: "Wallet", id: "TRANSACTIONS" },
      ],
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetTransactionsQuery,
  useSetupPinMutation,
  useAddMoneyMutation,
  useSendMoneyMutation,
  usePayDuesMutation,
  usePayDuesUPIMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = walletApi;
