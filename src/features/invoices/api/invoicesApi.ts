import { baseApi } from "@/services/api/baseApi";
import type { ApiResponse } from "@/types/api";
import type { Invoice, InvoiceList, InvoicePayload, InvoiceStatus, InvoiceVendor } from "../types";

export interface InvoiceFilters {
  associationId: string;
  vendorId?: string;
  status?: InvoiceStatus;
  fiscalPeriod?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<InvoiceList, InvoiceFilters>({
      query: ({ associationId, vendorId, status, fiscalPeriod, search, page, pageSize }) => ({
        url: "/invoices",
        params: { association_id: associationId, vendor_id: vendorId, status_filter: status, fiscal_period: fiscalPeriod, search, page, page_size: pageSize },
      }),
      transformResponse: (response: ApiResponse<InvoiceList>) => response.data,
      providesTags: ["Invoices"],
    }),
    getInvoiceVendors: builder.query<InvoiceVendor[], string>({
      query: (associationId) => ({ url: "/invoices/vendors", params: { association_id: associationId } }),
      transformResponse: (response: ApiResponse<InvoiceVendor[]>) => response.data,
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
    updateInvoiceStatus: builder.mutation<
      Invoice,
      { id: string; associationId: string; status: InvoiceStatus; paymentDate?: string; paymentMethod?: string }
    >({
      query: ({ id, associationId, status, paymentDate, paymentMethod }) => ({
        url: `/invoices/${id}/status`,
        method: "PATCH",
        data: {
          association_id: associationId,
          status,
          payment_date: paymentDate,
          payment_method: paymentMethod,
        },
      }),
      transformResponse: (response: ApiResponse<Invoice>) => response.data,
      invalidatesTags: ["Invoices"],
    }),
    deleteInvoice: builder.mutation<{ id: string }, { id: string; associationId: string }>({
      query: ({ id, associationId }) => ({ url: `/invoices/${id}`, method: "DELETE", params: { association_id: associationId } }),
      transformResponse: (response: ApiResponse<{ id: string }>) => response.data,
      invalidatesTags: ["Invoices"],
    }),
  }),
});

export const { useGetInvoicesQuery, useGetInvoiceVendorsQuery, useCreateInvoiceMutation, useUpdateInvoiceMutation, useUpdateInvoiceStatusMutation, useDeleteInvoiceMutation } = invoicesApi;
