import { baseApi } from "@/services/api/baseApi";
import type {
  CreatePreApprovedVisitorPayload,
  CreatePreApprovedVisitorResponse,
  PublicVisitorPassResponse,
  PreApprovedVisitorsResponse,
  DeliveryRow,
  VisitorGateRow,
} from "../types";

type Envelope<T> = { data?: T } | T;

const unwrap = <T,>(response: Envelope<T>): T =>
  "data" in response && response.data !== undefined ? response.data : response;

export const visitorManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPreApprovedVisitors: builder.query<PreApprovedVisitorsResponse, void>({
      query: () => ({
        url: "/resident/preapproved-visitors",
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: [{ type: "Visitors", id: "PREAPPROVED_LIST" }],
    }),
    getPublicVisitorPass: builder.query<PublicVisitorPassResponse, string>({
      query: (passCode) => ({
        url: `/public/visitor-passes/${encodeURIComponent(passCode)}`,
        method: "GET",
      }),
      transformResponse: unwrap,
    }),
    createPreApprovedVisitor: builder.mutation<
      CreatePreApprovedVisitorResponse,
      CreatePreApprovedVisitorPayload
    >({
      query: (data) => ({
        url: "/resident/preapproved-visitors",
        method: "POST",
        data,
      }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "Visitors", id: "PREAPPROVED_LIST" }],
    }),
    cancelPreApprovedVisitor: builder.mutation<{ ok: boolean }, string>({
      query: (passId) => ({
        url: `/resident/preapproved-visitors/${passId}`,
        method: "DELETE",
      }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "Visitors", id: "PREAPPROVED_LIST" }],
    }),
    getVisitorCheckins: builder.query<{ visitors: VisitorGateRow[] }, void>({
      query: () => ({ url: "/security/visitors/checkin-list", method: "GET" }),
      transformResponse: (response: Envelope<{ visitors: VisitorGateRow[] }>) => unwrap(response),
    }),
    getVisitorCheckouts: builder.query<{ visitors: VisitorGateRow[] }, void>({
      query: () => ({ url: "/security/visitors/checkout-list", method: "GET" }),
      transformResponse: (response: Envelope<{ visitors: VisitorGateRow[] }>) => unwrap(response),
    }),
    getVisitorHistory: builder.query<{ visitors: VisitorGateRow[] }, void>({
      query: () => ({ url: "/security/visitors/history", method: "GET" }),
      transformResponse: (response: Envelope<{ visitors: VisitorGateRow[] }>) => unwrap(response),
    }),
    checkOutVisitor: builder.mutation<{ log_id?: string }, string>({
      query: (logId) => ({ url: `/security/visitors/log/${logId}/check-out`, method: "POST" }),
      transformResponse: (response: Envelope<{ log_id?: string }>) => unwrap(response),
      invalidatesTags: [{ type: "Visitors", id: "GATE_LIST" }],
    }),
    getActiveDeliveries: builder.query<{ deliveries: DeliveryRow[] }, void>({
      query: () => ({ url: "/security/deliveries/active", method: "GET" }),
      transformResponse: (response: Envelope<{ deliveries: DeliveryRow[] }>) => unwrap(response),
    }),
    getDeliveryHistory: builder.query<{ deliveries: DeliveryRow[] }, void>({
      query: () => ({ url: "/security/deliveries/history", method: "GET" }),
      transformResponse: (response: Envelope<{ deliveries: DeliveryRow[] }>) => unwrap(response),
    }),
    completeDelivery: builder.mutation<{ id?: string }, string>({
      query: (deliveryId) => ({ url: `/security/deliveries/${deliveryId}/complete`, method: "POST" }),
      transformResponse: (response: Envelope<{ id?: string }>) => unwrap(response),
      invalidatesTags: [{ type: "Visitors", id: "DELIVERY_LIST" }],
    }),
  }),
});

export const {
  useGetPreApprovedVisitorsQuery,
  useGetPublicVisitorPassQuery,
  useCreatePreApprovedVisitorMutation,
  useCancelPreApprovedVisitorMutation,
  useGetVisitorCheckinsQuery,
  useGetVisitorCheckoutsQuery,
  useGetVisitorHistoryQuery,
  useCheckOutVisitorMutation,
  useGetActiveDeliveriesQuery,
  useGetDeliveryHistoryQuery,
  useCompleteDeliveryMutation,
} = visitorManagementApi;
