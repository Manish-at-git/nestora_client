import { baseApi } from "@/services/api/baseApi";
import type {
  CreatePreApprovedVisitorPayload,
  CreatePreApprovedVisitorResponse,
  PublicVisitorPassResponse,
  PreApprovedVisitorsResponse,
  DeliveryRow,
  VisitorGateRow,
  PendingVisitorRequest,
  ResidentSearchResult,
  SecurityGateRequest,
  WalkInVisitorPayload,
} from "../types";

export interface SecurityCheckInPayload {
  passId: string;
  otp: string;
  gate?: string;
  remarks?: string;
}

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
    getSecurityPreApprovedVisitors: builder.query<PreApprovedVisitorsResponse, string | undefined>({
      query: (search) => ({
        url: search
          ? "/security/preapproved-visitors/search"
          : "/security/preapproved-visitors/today",
        method: "GET",
        params: search ? { q: search } : undefined,
      }),
      transformResponse: unwrap,
      providesTags: [{ type: "Visitors", id: "SECURITY_PREAPPROVED_LIST" }],
    }),
    checkInPreApprovedVisitor: builder.mutation<{ log_id?: string }, SecurityCheckInPayload>({
      query: ({ passId, ...data }) => ({
        url: `/security/preapproved-visitors/${passId}/check-in`,
        method: "POST",
        data,
      }),
      transformResponse: (response: Envelope<{ log_id?: string }>) => unwrap(response),
      invalidatesTags: [
        { type: "Visitors", id: "SECURITY_PREAPPROVED_LIST" },
        { type: "Visitors", id: "GATE_LIST" },
      ],
    }),
    getVisitorCheckins: builder.query<{ visitors: VisitorGateRow[] }, void>({
      query: () => ({ url: "/security/visitors/active", method: "GET" }),
      transformResponse: (response: Envelope<{ visitors: VisitorGateRow[] }>) => unwrap(response),
      providesTags: [{ type: "Visitors", id: "GATE_LIST" }],
    }),
    getSecurityGateRequests: builder.query<{ requests: SecurityGateRequest[] }, void>({
      query: () => ({ url: "/security/visitor/requests", method: "GET" }),
      transformResponse: (response: Envelope<{ requests: SecurityGateRequest[] }>) => unwrap(response),
      providesTags: [{ type: "Visitors", id: "GATE_REQUESTS" }],
    }),
    getVisitorCheckouts: builder.query<{ visitors: VisitorGateRow[] }, void>({
      query: () => ({ url: "/security/visitors/checkout-list", method: "GET" }),
      transformResponse: (response: Envelope<{ visitors: VisitorGateRow[] }>) => unwrap(response),
    }),
    getVisitorHistory: builder.query<{ visitors: VisitorGateRow[] }, void>({
      query: () => ({ url: "/security/visitors/history", method: "GET" }),
      transformResponse: (response: Envelope<{ visitors: VisitorGateRow[] }>) => unwrap(response),
    }),
    getSecurityGateRequestHistory: builder.query<{ requests: SecurityGateRequest[] }, void>({
      query: () => ({ url: "/security/visitor/requests/history", method: "GET" }),
      transformResponse: (response: Envelope<{ requests: SecurityGateRequest[] }>) => unwrap(response),
      providesTags: [{ type: "Visitors", id: "SECURITY_GATE_REQUEST_HISTORY" }],
    }),
    getResidentVisitorHistory: builder.query<{ visitors: VisitorGateRow[] }, void>({
      query: () => ({ url: "/resident/visitors/history", method: "GET" }),
      transformResponse: (response: Envelope<{ visitors: VisitorGateRow[] }>) => unwrap(response),
    }),
    getResidentGateRequestHistory: builder.query<{ requests: SecurityGateRequest[] }, void>({
      query: () => ({ url: "/resident/visitor/requests/history", method: "GET" }),
      transformResponse: (response: Envelope<{ requests: SecurityGateRequest[] }>) => unwrap(response),
      providesTags: [{ type: "Visitors", id: "RESIDENT_GATE_REQUEST_HISTORY" }],
    }),
    getPendingVisitorRequests: builder.query<{ requests: PendingVisitorRequest[] }, void>({
      query: () => ({ url: "/resident/visitor/pending", method: "GET" }),
      transformResponse: (response: Envelope<{ requests: PendingVisitorRequest[] }>) => unwrap(response),
      providesTags: [{ type: "Visitors", id: "PENDING_REQUESTS" }],
    }),
    approveVisitorRequest: builder.mutation<{ pass_code?: string }, string>({
      query: (visitId) => ({ url: `/resident/visitor/${visitId}/approve`, method: "POST" }),
      transformResponse: unwrap,
      invalidatesTags: [
        { type: "Visitors", id: "PENDING_REQUESTS" },
        { type: "Visitors", id: "RESIDENT_GATE_REQUEST_HISTORY" },
        { type: "Visitors", id: "SECURITY_GATE_REQUEST_HISTORY" },
        { type: "Visitors", id: "GATE_REQUESTS" },
      ],
    }),
    rejectVisitorRequest: builder.mutation<{ ok: boolean }, string>({
      query: (visitId) => ({ url: `/resident/visitor/${visitId}/reject`, method: "POST" }),
      transformResponse: unwrap,
      invalidatesTags: [
        { type: "Visitors", id: "PENDING_REQUESTS" },
        { type: "Visitors", id: "RESIDENT_GATE_REQUEST_HISTORY" },
        { type: "Visitors", id: "SECURITY_GATE_REQUEST_HISTORY" },
        { type: "Visitors", id: "GATE_REQUESTS" },
      ],
    }),
    searchResidents: builder.query<{ residents: ResidentSearchResult[] }, string>({
      query: (q) => ({ url: "/security/residents/search", method: "GET", params: { q } }),
      transformResponse: (response: Envelope<{ residents: ResidentSearchResult[] }>) => unwrap(response),
    }),
    createWalkInRequest: builder.mutation<{ id?: string }, WalkInVisitorPayload>({
      query: (data) => ({ url: "/security/visitor/request", method: "POST", data }),
      transformResponse: unwrap,
      invalidatesTags: [
        { type: "Visitors", id: "GATE_REQUESTS" },
        { type: "Visitors", id: "SECURITY_GATE_REQUEST_HISTORY" },
      ],
    }),
    getWalkInStatus: builder.query<Record<string, unknown>, string>({
      query: (visitId) => ({ url: `/security/visitor/status/${visitId}`, method: "GET" }),
      transformResponse: unwrap,
    }),
    checkInWalkInVisitor: builder.mutation<{ id?: string }, string>({
      query: (visitId) => ({ url: `/security/visitor/${visitId}/check-in`, method: "POST", data: {} }),
      transformResponse: unwrap,
      invalidatesTags: [
        { type: "Visitors", id: "GATE_LIST" },
        { type: "Visitors", id: "GATE_REQUESTS" },
        { type: "Visitors", id: "SECURITY_GATE_REQUEST_HISTORY" },
        { type: "Visitors", id: "RESIDENT_GATE_REQUEST_HISTORY" },
      ],
    }),
    checkOutVisitor: builder.mutation<{ log_id?: string }, string>({
      query: (logId) => ({ url: `/security/visitors/log/${logId}/check-out`, method: "POST" }),
      transformResponse: (response: Envelope<{ log_id?: string }>) => unwrap(response),
      invalidatesTags: [
        { type: "Visitors", id: "GATE_LIST" },
        { type: "Visitors", id: "SECURITY_GATE_REQUEST_HISTORY" },
        { type: "Visitors", id: "RESIDENT_GATE_REQUEST_HISTORY" },
      ],
    }),
    checkOutWalkInVisitor: builder.mutation<{ id?: string }, string>({
      query: (visitId) => ({ url: `/security/visitor/${visitId}/check-out`, method: "POST" }),
      transformResponse: unwrap,
      invalidatesTags: [
        { type: "Visitors", id: "GATE_LIST" },
        { type: "Visitors", id: "SECURITY_GATE_REQUEST_HISTORY" },
        { type: "Visitors", id: "RESIDENT_GATE_REQUEST_HISTORY" },
      ],
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
  useGetSecurityPreApprovedVisitorsQuery,
  useCheckInPreApprovedVisitorMutation,
  useGetVisitorCheckinsQuery,
  useGetSecurityGateRequestsQuery,
  useGetVisitorCheckoutsQuery,
  useGetVisitorHistoryQuery,
  useGetSecurityGateRequestHistoryQuery,
  useGetResidentVisitorHistoryQuery,
  useGetResidentGateRequestHistoryQuery,
  useGetPendingVisitorRequestsQuery,
  useApproveVisitorRequestMutation,
  useRejectVisitorRequestMutation,
  useLazySearchResidentsQuery,
  useCreateWalkInRequestMutation,
  useGetWalkInStatusQuery,
  useCheckInWalkInVisitorMutation,
  useCheckOutVisitorMutation,
  useCheckOutWalkInVisitorMutation,
  useGetActiveDeliveriesQuery,
  useGetDeliveryHistoryQuery,
  useCompleteDeliveryMutation,
} = visitorManagementApi;
