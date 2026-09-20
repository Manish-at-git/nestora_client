import { baseApi } from "@/services/api/baseApi";
import type { Meeting, MeetingFormData, MeetingMinutesFormData } from "../types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const meetingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeetings: builder.query<Meeting[], string | number | undefined>({
      query: (associationId) => ({
        url: "/meetings",
        params:
          associationId && associationId !== "ALL"
            ? { association_id: associationId }
            : undefined,
      }),
      transformResponse: (response: ApiResponse<Meeting[]>) => response.data || [],
      providesTags: ["Meetings"],
    }),

    createMeeting: builder.mutation<
      { ok: boolean },
      MeetingFormData
    >({
      query: (formData) => ({
        url: "/meetings",
        method: "POST",
        data: formData,
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
      }),
      invalidatesTags: ["Meetings"],
    }),

    updateMeetingDetails: builder.mutation<
      { ok: boolean; message: string },
      { id: string | number } & MeetingFormData
    >({
      query: ({ id, ...formData }) => ({
        url: `/meetings/${id}/details`,
        method: "PATCH",
        data: formData,
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
        message: response.message,
      }),
      invalidatesTags: ["Meetings"],
    }),

    addMeetingMinutes: builder.mutation<
      { ok: boolean; message: string },
      { id: string | number } & MeetingMinutesFormData
    >({
      query: ({ id, ...formData }) => ({
        url: `/meetings/${id}/minutes`,
        method: "PATCH",
        data: formData,
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
        message: response.message,
      }),
      invalidatesTags: ["Meetings"],
    }),

    deleteMeeting: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/meetings/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
      }),
      invalidatesTags: ["Meetings"],
    }),

    updateMeetingAttendance: builder.mutation<
      { ok: boolean },
      { id: string | number; status: "Yes" | "No" | "Maybe" | string }
    >({
      query: ({ id, status }) => ({
        url: `/meetings/${id}/attendance`,
        method: "POST",
        data: { status },
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
      }),
      invalidatesTags: ["Meetings"],
    }),
  }),
});

export const {
  useGetMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingDetailsMutation,
  useAddMeetingMinutesMutation,
  useDeleteMeetingMutation,
  useUpdateMeetingAttendanceMutation,
} = meetingsApi;
