import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type { ChatPool, ChatPoolMessage, ChatPoolType } from "../types";

export const chatPoolApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatPools: builder.query<ChatPool[], void>({
      query: () => ({ url: "/chat-pools", method: "GET" }),
      transformResponse: (response: unknown) => unwrapApiList<ChatPool>(response),
      providesTags: [{ type: "ChatPools", id: "LIST" }],
    }),
    getChatPoolMessages: builder.query<
      ChatPoolMessage[],
      { poolType: ChatPoolType; poolId: string; associationId: string }
    >({
      query: ({ poolType, poolId, associationId }) => ({
        url: `/board_chat/${poolType}/${poolId}`,
        method: "GET",
        params: { assoc_id: associationId },
      }),
      transformResponse: (response: unknown) => unwrapApiList<ChatPoolMessage>(response),
      providesTags: (_result, _error, args) => [
        { type: "ChatPools", id: `${args.poolType}-${args.poolId}` },
      ],
    }),
    sendChatPoolMessage: builder.mutation<
      ChatPoolMessage,
      {
        poolType: ChatPoolType;
        poolId: string;
        associationId: string;
        message: string;
        attachmentUrl?: string;
      }
    >({
      query: ({ poolType, poolId, associationId, message, attachmentUrl }) => ({
        url: `/board_chat/${poolType}/${poolId}`,
        method: "POST",
        params: { assoc_id: associationId },
        data: { message, attachment_url: attachmentUrl },
      }),
      transformResponse: (response: unknown) => unwrapApiData<ChatPoolMessage>(response),
      invalidatesTags: (_result, _error, args) => [
        { type: "ChatPools", id: `${args.poolType}-${args.poolId}` },
      ],
    }),
  }),
});

export const {
  useGetChatPoolsQuery,
  useGetChatPoolMessagesQuery,
  useSendChatPoolMessageMutation,
} = chatPoolApi;
