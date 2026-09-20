import baseApi from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type { Vendor, VendorCreatePayload, VendorUpdatePayload } from "../types";

export const vendorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<Vendor[], void>({
      query: () => ({
        url: "/admin/vendors",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<Vendor>(response),
      providesTags: ["Vendors"],
    }),

    createVendor: builder.mutation<{ ok: boolean; id: string; message: string }, VendorCreatePayload>({
      query: (data) => ({
        url: "/admin/vendors",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData(response),
      invalidatesTags: ["Vendors"],
    }),

    updateVendor: builder.mutation<
      { ok: boolean; message: string },
      { id: string; data: VendorUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/vendors/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData(response),
      invalidatesTags: ["Vendors"],
    }),

    deleteVendor: builder.mutation<{ ok: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admin/vendors/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrapApiData(response),
      invalidatesTags: ["Vendors"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorsApi;
