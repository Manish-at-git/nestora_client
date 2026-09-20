import { baseApi } from "@/services/api/baseApi";
import type {
  Committee,
  CreateCommitteePayload,
  UpdateCommitteePayload,
  CommitteeChatMessage,
} from "../types";

export const committeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommittees: builder.query<Committee[], { assoc_id?: string } | void>({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params && params.assoc_id && params.assoc_id !== "ALL") {
          queryParams.assoc_id = params.assoc_id;
        }
        return {
          url: "/admin/committees",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: { success: boolean; data?: Committee[] } | Committee[]) =>
        Array.isArray(response) ? response : response?.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Committees" as const, id })),
              { type: "Committees", id: "LIST" },
            ]
          : [{ type: "Committees", id: "LIST" }],
    }),

    createCommittee: builder.mutation<
      { ok: boolean; data: { id: string } },
      CreateCommitteePayload
    >({
      query: (data) => ({
        url: "/admin/committees",
        method: "POST",
        data,
      }),
      transformResponse: (response: { success: boolean; data?: { id: string } }) =>
        ({ ok: response.success, data: response.data || { id: "" } }),
      invalidatesTags: [
        { type: "Committees", id: "LIST" },
        { type: "CommitteeMembers", id: "LIST" },
      ],
    }),

    updateCommittee: builder.mutation<
      { ok: boolean },
      { id: string; data: UpdateCommitteePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/committees/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: { success: boolean; data?: { updated: boolean } }) =>
        ({ ok: response.success }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Committees", id },
        { type: "Committees", id: "LIST" },
        { type: "CommitteeMembers", id: "LIST" },
      ],
    }),

    getAssociationHomeowners: builder.query<
      import("../types").HomeownerOption[],
      string | number
    >({
      query: (assocId) => ({
        url: `/admin/associations/${assocId}/homeowners`,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data?: import("../types").HomeownerOption[] }) =>
        response?.data || [],
    }),

    deleteCommittee: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/admin/committees/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; data?: { updated: boolean } }) =>
        ({ ok: response.success }),
      invalidatesTags: [
        { type: "Committees", id: "LIST" },
        { type: "CommitteeMembers", id: "LIST" },
      ],
    }),

    getCommitteeChat: builder.query<
      CommitteeChatMessage[],
      { pool_type: string; pool_id: string; assoc_id: string }
    >({
      query: ({ pool_type, pool_id, assoc_id }) => ({
        url: `/board_chat/${pool_type}/${pool_id}`,
        method: "GET",
        params: { assoc_id },
      }),
      transformResponse: (response: { success: boolean; data?: CommitteeChatMessage[] }) =>
        response.data || [],
      providesTags: (_result, _error, args) => [
        { type: "Committees", id: `CHAT-${args.pool_type}-${args.pool_id}` },
      ],
    }),

    sendCommitteeChat: builder.mutation<
      CommitteeChatMessage,
      {
        pool_type: string;
        pool_id: string;
        assoc_id: string;
        message: string;
        attachment_url?: string | null;
      }
    >({
      query: ({ pool_type, pool_id, assoc_id, message, attachment_url }) => ({
        url: `/board_chat/${pool_type}/${pool_id}`,
        method: "POST",
        params: { assoc_id },
        data: { message, attachment_url },
      }),
      transformResponse: (response: { success: boolean; data?: CommitteeChatMessage }) =>
        response.data || { id: "" },
      invalidatesTags: (_result, _error, args) => [
        { type: "Committees", id: `CHAT-${args.pool_type}-${args.pool_id}` },
      ],
    }),
  }),
});

export const {
  useGetCommitteesQuery,
  useLazyGetCommitteesQuery,
  useLazyGetAssociationHomeownersQuery,
  useCreateCommitteeMutation,
  useUpdateCommitteeMutation,
  useDeleteCommitteeMutation,
  useGetCommitteeChatQuery,
  useSendCommitteeChatMutation,
} = committeesApi;
