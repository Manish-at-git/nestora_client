import { baseApi } from "@/services/api/baseApi";
import type { Poll, PollFormData } from "../types";

interface ApiResponse<T> { success: boolean; data?: T; message?: string }

export const pollsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPolls: builder.query<Poll[], { association_id?: string | number; scope?: string } | void>({
      query: (params) => ({
        url: "/polls",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: ApiResponse<Poll[]>) => response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Polls" as const, id })),
              { type: "Polls", id: "LIST" },
            ]
          : [{ type: "Polls", id: "LIST" }],
    }),
    createPoll: builder.mutation<Poll, PollFormData>({
      query: (body) => ({
        url: "/polls",
        method: "POST",
        data: {
          ...body,
          options: body.options.map((opt) =>
            typeof opt === "string" ? { text: opt } : opt
          ),
        },
      }),
      transformResponse: (response: ApiResponse<{ id: string | number }>) => ({ ...(response.data || {}), ok: response.success } as Poll),
      invalidatesTags: [{ type: "Polls", id: "LIST" }],
    }),
    updatePoll: builder.mutation<Poll, { id: string | number; data: Partial<PollFormData> }>({
      query: ({ id, data }) => ({
        url: `/polls/${id}`,
        method: "PUT",
        data: {
          ...data,
          options: data.options
            ? data.options.map((opt) =>
                typeof opt === "string" ? { text: opt } : opt
              )
            : undefined,
        },
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({ ok: response.success } as Poll),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Polls", id },
        { type: "Polls", id: "LIST" },
      ],
    }),
    deletePoll: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/polls/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({ ok: response.success }),
      invalidatesTags: [{ type: "Polls", id: "LIST" }],
    }),
    votePoll: builder.mutation<
      { ok: boolean; poll?: Poll },
      { pollId: string | number; optionIds: Array<string | number> }
    >({
      query: ({ pollId, optionIds }) => ({
        url: `/polls/${pollId}/vote`,
        method: "POST",
        data: { option_ids: optionIds },
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({ ok: response.success }),
      invalidatesTags: (_result, _error, { pollId }) => [
        { type: "Polls", id: pollId },
        { type: "Polls", id: "LIST" },
      ],
    }),
    toggleLikePoll: builder.mutation<{ ok: boolean; likes_count?: number; user_has_liked?: boolean }, string | number>({
      query: (pollId) => ({
        url: `/polls/${pollId}/like`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ liked: boolean }>) => ({ ok: response.success, liked: Boolean(response.data?.liked) }),
      invalidatesTags: (_result, _error, pollId) => [
        { type: "Polls", id: pollId },
        { type: "Polls", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPollsQuery,
  useCreatePollMutation,
  useUpdatePollMutation,
  useDeletePollMutation,
  useVotePollMutation,
  useToggleLikePollMutation,
} = pollsApi;
