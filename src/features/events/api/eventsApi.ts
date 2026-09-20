import { baseApi } from "@/services/api/baseApi";
import type { EventItem, EventFormData, RSVPStatus, EventComment } from "../types";

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
} = eventsApi;
