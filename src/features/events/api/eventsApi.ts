import { baseApi } from "@/services/api/baseApi";
import type { EventItem, EventFormData, RSVPStatus, EventComment } from "../types";

export interface EventPass {
  id: string;
  event_id: string;
  buyer_name?: string;
  buyer_mobile?: string;
  pass_code: string;
  total_passes: number;
  remaining_passes: number;
  checked_in_passes: number;
  amount_paid: number;
  status: string;
  is_shared?: boolean;
  shared_from_pass_id?: string | null;
  created_at?: string;
  last_checked_in_at?: string | null;
}

export interface EventPassDetail {
  pass: EventPass;
  event: EventItem;
  association?: { id: string; name: string; country?: string } | null;
  transfers: Array<{ new_pass_id: string; recipient_mobile: string; count: number; created_at: string }>;
  is_owner: boolean;
}

export interface EventPassSummary {
  total_passes_booked: number;
  total_active_passes: number;
  total_checked_in: number;
  total_revenue?: number;
  total_pass_records: number;
}

interface ApiResponse<T> { success: boolean; data?: T; message?: string }

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<
      EventItem[],
      { scope?: string; association_id?: string | number } | void
    >({
      query: (params) => ({
        url: "/events",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: ApiResponse<EventItem[]>) => response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Events" as const, id })),
              { type: "Events", id: "LIST" },
            ]
          : [{ type: "Events", id: "LIST" }],
    }),

    createEvent: builder.mutation<{ ok: boolean; id: string | number }, EventFormData>({
      query: (body) => ({
        url: "/events",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: ApiResponse<{ id: string | number }>) => ({ ok: response.success, id: response.data?.id || "" }),
      invalidatesTags: [{ type: "Events", id: "LIST" }],
    }),

    updateEvent: builder.mutation<
      { ok: boolean },
      { id: string | number; data: Partial<EventFormData> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/events/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({ ok: response.success }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Events", id },
        { type: "Events", id: "LIST" },
      ],
    }),

    deleteEvent: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/admin/events/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({ ok: response.success }),
      invalidatesTags: [{ type: "Events", id: "LIST" }],
    }),

    submitRSVP: builder.mutation<
      { ok: boolean; status: RSVPStatus },
      { eventId: string | number; status: RSVPStatus }
    >({
      query: ({ eventId, status }) => ({
        url: `/events/${eventId}/rsvp`,
        method: "POST",
        data: { status },
      }),
      transformResponse: (response: ApiResponse<{ status: RSVPStatus }>) => ({ ok: response.success, status: response.data?.status as RSVPStatus }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "Events", id: eventId },
        { type: "Events", id: "LIST" },
      ],
    }),

    cancelRSVP: builder.mutation<{ ok: boolean }, string | number>({
      query: (eventId) => ({
        url: `/events/${eventId}/rsvp`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({ ok: response.success }),
      invalidatesTags: (_result, _error, eventId) => [
        { type: "Events", id: eventId },
        { type: "Events", id: "LIST" },
      ],
    }),

    toggleLikeEvent: builder.mutation<{ ok: boolean; liked: boolean }, string | number>({
      query: (eventId) => ({
        url: `/events/${eventId}/like`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ liked: boolean }>) => ({ ok: response.success, liked: Boolean(response.data?.liked) }),
      invalidatesTags: (_result, _error, eventId) => [
        { type: "Events", id: eventId },
      ],
    }),

    getEventComments: builder.query<EventComment[], string | number>({
      query: (eventId) => ({
        url: `/events/${eventId}/comments`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<EventComment[]>) => response.data || [],
      providesTags: (_result, _error, eventId) => [
        { type: "Events", id: `COMMENTS_${eventId}` },
      ],
    }),

    addEventComment: builder.mutation<
      { ok: boolean; id: string | number },
      { eventId: string | number; comment: string }
    >({
      query: ({ eventId, comment }) => ({
        url: `/events/${eventId}/comments`,
        method: "POST",
        data: { comment },
      }),
      transformResponse: (response: ApiResponse<{ id: string | number }>) => ({ ok: response.success, id: response.data?.id || "" }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "Events", id: `COMMENTS_${eventId}` },
        { type: "Events", id: eventId },
      ],
    }),

    bookEventPass: builder.mutation<
      { pass_id: string; pass_code: string; pass_link: string; total_amount: number; message: string },
      { eventId: string | number; member_count: number; payment_method: "wallet" | "upi"; pin?: string }
    >({
      query: ({ eventId, ...data }) => ({ url: `/events/${eventId}/book-pass`, method: "POST", data }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: (result) => [
        { type: "Events", id: "LIST" },
        ...(result?.pass_id
          ? [{ type: "Events" as const, id: `PASS_${result.pass_id}` }]
          : []),
      ],
    }),
    getEventPass: builder.query<EventPassDetail, string>({
      query: (passId) => ({ url: `/events/passes/${passId}`, method: "GET" }),
      transformResponse: (response: ApiResponse<EventPassDetail>) => response.data as EventPassDetail,
      providesTags: (_result, _error, passId) => [{ type: "Events", id: `PASS_${passId}` }],
    }),
    shareEventPass: builder.mutation<
      { new_pass_id: string; new_pass_link: string; remaining_passes: number; shared_count: number; message: string },
      { passId: string; recipient_mobile: string; count: number }
    >({
      query: ({ passId, ...data }) => ({ url: `/events/passes/${passId}/share`, method: "POST", data }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: (_result, _error, { passId }) => [
        { type: "Events", id: `PASS_${passId}` },
        { type: "Events", id: "LIST" },
      ],
    }),
    getEventPasses: builder.query<{ event: EventItem; summary: EventPassSummary; passes: EventPass[] }, string | number>({
      query: (eventId) => ({ url: `/admin/events/${eventId}/passes`, method: "GET" }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      providesTags: (_result, _error, eventId) => [{ type: "Events", id: `PASSES_${eventId}` }],
    }),
    verifyEventPass: builder.mutation<any, { eventId: string | number; query: string }>({
      query: ({ eventId, query }) => ({ url: `/admin/events/${eventId}/passes/verify-scan`, method: "POST", data: { query } }),
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),
    checkInEventPass: builder.mutation<
      { admitted_now: number; remaining_passes: number; checked_in_passes: number; message: string },
      { eventId: string | number; passId: string; admit_count: number; notes?: string }
    >({
      query: ({ eventId, passId, ...data }) => ({ url: `/admin/events/${eventId}/passes/${passId}/check-in`, method: "POST", data }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: (_result, _error, { eventId, passId }) => [
        { type: "Events", id: `PASSES_${eventId}` },
        { type: "Events", id: `PASS_${passId}` },
        { type: "Events", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useSubmitRSVPMutation,
  useCancelRSVPMutation,
  useToggleLikeEventMutation,
  useGetEventCommentsQuery,
  useAddEventCommentMutation,
  useBookEventPassMutation,
  useGetEventPassQuery,
  useShareEventPassMutation,
  useGetEventPassesQuery,
  useVerifyEventPassMutation,
  useCheckInEventPassMutation,
} = eventsApi;
