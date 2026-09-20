import { baseApi } from "@/services/api/baseApi";
import type { Announcement, AnnouncementFormData, AnnouncementComment } from "../types";

export const announcementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<Announcement[], { association_id?: string | number } | void>({
      query: (params) => ({
        url: "/announcements",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: { success: boolean; data?: Announcement[] }) => response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Announcements" as const, id })),
              { type: "Announcements", id: "LIST" },
            ]
          : [{ type: "Announcements", id: "LIST" }],
    }),
    createAnnouncement: builder.mutation<{ ok: boolean; id: string | number }, AnnouncementFormData>({
      query: (body) => ({
        url: "/announcements",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: { success: boolean; data?: { id: string | number } }) => ({
        ok: response.success,
        id: response.data?.id || "",
      }),
      invalidatesTags: [{ type: "Announcements", id: "LIST" }],
    }),
    updateAnnouncement: builder.mutation<{ ok: boolean }, { id: string | number; data: Partial<AnnouncementFormData> }>({
      query: ({ id, data }) => ({
        url: `/admin/announcements/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: { success: boolean }) => ({ ok: response.success }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Announcements", id },
        { type: "Announcements", id: "LIST" },
      ],
    }),
    deleteAnnouncement: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/admin/announcements/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean }) => ({ ok: response.success }),
      invalidatesTags: [{ type: "Announcements", id: "LIST" }],
    }),
    toggleLikeAnnouncement: builder.mutation<{ ok: boolean; liked: boolean }, string | number>({
      query: (id) => ({
        url: `/announcements/${id}/like`,
        method: "POST",
      }),
      transformResponse: (response: { success: boolean; data?: { liked: boolean } }) => ({
        ok: response.success,
        liked: Boolean(response.data?.liked),
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Announcements", id }],
    }),
    getAnnouncementComments: builder.query<AnnouncementComment[], string | number>({
      query: (id) => ({
        url: `/announcements/${id}/comments`,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data?: AnnouncementComment[] }) => response.data || [],
      providesTags: (_result, _error, id) => [{ type: "Announcements", id: `COMMENTS_${id}` }],
    }),
    addAnnouncementComment: builder.mutation<{ ok: boolean; id: string | number }, { id: string | number; comment: string }>({
      query: ({ id, comment }) => ({
        url: `/announcements/${id}/comment`,
        method: "POST",
        data: { comment },
      }),
      transformResponse: (response: { success: boolean; data?: { id: string | number } }) => ({
        ok: response.success,
        id: response.data?.id || "",
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Announcements", id: `COMMENTS_${id}` }],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useToggleLikeAnnouncementMutation,
  useGetAnnouncementCommentsQuery,
  useAddAnnouncementCommentMutation,
} = announcementsApi;
