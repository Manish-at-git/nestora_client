import { baseApi } from "@/services/api/baseApi";
import type {
  ServiceRequest,
  ServiceRequestMessage,
  CreateServiceRequestPayload,
  UpdateServiceRequestStatusPayload,
  MapServiceRequestPayload,
  SendServiceRequestMessagePayload,
  BlockOption,
  UnitOption,
  HomeownerOption,
} from "../types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const serviceRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServiceRequests: builder.query<
      ServiceRequest[],
      string | number | { association_id?: string | number } | void | undefined
    >({
      query: (arg) => {
        const assocId =
          typeof arg === "object" && arg !== null && "association_id" in arg
            ? arg.association_id
            : arg;

        return {
          url: "/service-requests",
          method: "GET",
          params:
            assocId && String(assocId) !== "ALL"
              ? { association_id: String(assocId) }
              : undefined,
        };
      },
      transformResponse: (response: ApiResponse<ServiceRequest[]>) => {
        return response?.data || [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ServiceRequests" as const, id })),
              { type: "ServiceRequests", id: "LIST" },
            ]
          : [{ type: "ServiceRequests", id: "LIST" }],
    }),

    getServiceRequestById: builder.query<ServiceRequest, string | number>({
      query: (id) => ({
        url: `/service-requests/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ServiceRequest>) => {
        return response?.data;
      },
      providesTags: (_result, _error, id) => [{ type: "ServiceRequests", id }],
    }),

    createServiceRequest: builder.mutation<
      { ok: boolean; id: string | number },
      CreateServiceRequestPayload
    >({
      query: (payload) => ({
        url: "/service-requests",
        method: "POST",
        data: payload,
      }),
      transformResponse: (response: ApiResponse<{ id: string | number }>) => ({
        ok: response.success,
        id: response.data.id,
      }),
      invalidatesTags: [{ type: "ServiceRequests", id: "LIST" }],
    }),

    updateServiceRequestStatus: builder.mutation<
      { ok: boolean },
      UpdateServiceRequestStatusPayload
    >({
      query: ({ id, status }) => ({
        url: `/service-requests/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ServiceRequests", id },
        { type: "ServiceRequests", id: "LIST" },
      ],
    }),

    mapServiceRequest: builder.mutation<
      { ok: boolean; message?: string },
      MapServiceRequestPayload
    >({
      query: ({ id, association_id, unit_id, user_id }) => ({
        url: `/service-requests/${id}/map`,
        method: "PATCH",
        data: { association_id, unit_id, user_id },
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
        message: response.message,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ServiceRequests", id },
        { type: "ServiceRequests", id: "LIST" },
      ],
    }),

    deleteServiceRequest: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/service-requests/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ServiceRequests", id },
        { type: "ServiceRequests", id: "LIST" },
      ],
    }),

    getServiceRequestMessages: builder.query<
      ServiceRequestMessage[],
      string | number
    >({
      query: (requestId) => ({
        url: `/service-requests/${requestId}/messages`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ServiceRequestMessage[]>) => {
        return response?.data || [];
      },
      providesTags: (result, error, requestId) => [
        { type: "ServiceRequests", id: `MESSAGES_${requestId}` },
      ],
    }),

    sendServiceRequestMessage: builder.mutation<
      { ok: boolean; id: string | number },
      SendServiceRequestMessagePayload
    >({
      query: ({ requestId, message, attachment_url }) => ({
        url: `/service-requests/${requestId}/messages`,
        method: "POST",
        data: { message, attachment_url },
      }),
      transformResponse: (response: ApiResponse<{ id: string | number }>) => ({
        ok: response.success,
        id: response.data.id,
      }),
      invalidatesTags: (result, error, { requestId }) => [
        { type: "ServiceRequests", id: `MESSAGES_${requestId}` },
      ],
    }),

    getAssociationBlocks: builder.query<BlockOption[], string | number>({
      query: (assocId) => ({
        url: `/associations/${assocId}/blocks`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<BlockOption[]>) => {
        return response?.data || [];
      },
    }),

    getBlockUnits: builder.query<UnitOption[], string | number>({
      query: (blockId) => ({
        url: `/admin/blocks/${blockId}/units`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<UnitOption[]>) => {
        return response?.data || [];
      },
    }),

    getAssociationAllUnits: builder.query<UnitOption[], string | number>({
      query: (assocId) => ({
        url: `/admin/associations/${assocId}/all-units`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<UnitOption[]>) => {
        return response?.data || [];
      },
    }),

    getUnitHomeowners: builder.query<HomeownerOption[], string | number>({
      query: (unitId) => ({
        url: `/admin/units/${unitId}/homeowners`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<HomeownerOption[]>) => {
        return response?.data || [];
      },
    }),
  }),
});

export const {
  useGetServiceRequestsQuery,
  useGetServiceRequestByIdQuery,
  useCreateServiceRequestMutation,
  useUpdateServiceRequestStatusMutation,
  useMapServiceRequestMutation,
  useDeleteServiceRequestMutation,
  useGetServiceRequestMessagesQuery,
  useSendServiceRequestMessageMutation,
  useGetAssociationBlocksQuery,
  useGetBlockUnitsQuery,
  useGetAssociationAllUnitsQuery,
  useGetUnitHomeownersQuery,
} = serviceRequestsApi;
