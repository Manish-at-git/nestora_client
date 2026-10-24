import { baseApi } from "@/services/api/baseApi";
import type { ApiResponse } from "@/types/api";
import type { Invoice, InvoiceList, InvoicePayload, InvoiceStatus } from "../types";

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<InvoiceList, { associationId: string; category?: string; status?: InvoiceStatus; search?: string }>({
      query: ({ associationId, category, status, search }) => ({ url: "/invoices", params: { association_id: associationId, category, status_filter: status, search } }),
      transformResponse: (response: ApiResponse<InvoiceList>) => response.data,
      providesTags: ["Invoices"],
    }),
    createInvoice: builder.mutation<Invoice, InvoicePayload>({
      query: (data) => ({ url: "/invoices", method: "POST", data }),
      transformResponse: (response: ApiResponse<Invoice>) => response.data,
      invalidatesTags: ["Invoices"],
    }),
    updateInvoice: builder.mutation<Invoice, { id: string; data: InvoicePayload }>({
      query: ({ id, data }) => ({ url: `/invoices/${id}`, method: "PUT", data }),
      transformResponse: (response: ApiResponse<Invoice>) => response.data,
      invalidatesTags: ["Invoices"],
    }),
  }),
});

export const { useGetInvoicesQuery, useCreateInvoiceMutation, useUpdateInvoiceMutation } = invoicesApi;
