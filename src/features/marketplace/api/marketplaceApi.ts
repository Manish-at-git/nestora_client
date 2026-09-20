import { baseApi } from "@/services/api/baseApi";
import type {
  MarketplaceCategory,
  MarketplaceItem,
  CreateMarketplaceItemPayload,
  UpdateMarketplaceItemPayload,
  MarketplaceFilters,
  MarketplaceChatMessage,
  MarketplaceChatThread,
} from "../types";

export const marketplaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMarketplaceCategories: builder.query<MarketplaceCategory[], void>({
      query: () => ({
        url: "/marketplace/categories",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response || [],
    }),

    getMarketplaceItems: builder.query<MarketplaceItem[], MarketplaceFilters | void>({
      query: (filters) => {
        const params: Record<string, any> = {};
        if (filters) {
          if (filters.category_id) params.category_id = filters.category_id;
          if (filters.condition) params.condition = filters.condition;
          if (filters.min_price !== undefined && filters.min_price !== "") params.min_price = filters.min_price;
          if (filters.max_price !== undefined && filters.max_price !== "") params.max_price = filters.max_price;
          if (filters.is_negotiable !== undefined && filters.is_negotiable !== "") params.is_negotiable = filters.is_negotiable;
          if (filters.status) params.status = filters.status;
          if (filters.sort) params.sort = filters.sort;
        }
        return {
          url: "/marketplace/items",
          method: "GET",
          params,
        };
      },
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Marketplace" as const, id })),
              { type: "Marketplace", id: "LIST" },
            ]
          : [{ type: "Marketplace", id: "LIST" }],
    }),

    getMyMarketplaceItems: builder.query<MarketplaceItem[], void>({
      query: () => ({
        url: "/marketplace/items/my",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: [{ type: "Marketplace", id: "MY_LIST" }],
    }),

    getSavedMarketplaceItems: builder.query<MarketplaceItem[], void>({
      query: () => ({
        url: "/marketplace/favorites",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: [{ type: "Marketplace", id: "SAVED_LIST" }],
    }),

    createMarketplaceItem: builder.mutation<
      { ok: boolean; id: string },
      CreateMarketplaceItemPayload
    >({
      query: (data) => ({
        url: "/marketplace/items",
        method: "POST",
        data,
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: [
        { type: "Marketplace", id: "LIST" },
        { type: "Marketplace", id: "MY_LIST" },
      ],
    }),

    updateMarketplaceItem: builder.mutation<
      { ok: boolean },
      { id: string; data: UpdateMarketplaceItemPayload }
    >({
      query: ({ id, data }) => ({
        url: `/marketplace/items/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Marketplace", id },
        { type: "Marketplace", id: "LIST" },
        { type: "Marketplace", id: "MY_LIST" },
        { type: "Marketplace", id: "SAVED_LIST" },
      ],
    }),

    deleteMarketplaceItem: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/marketplace/items/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: [
        { type: "Marketplace", id: "LIST" },
        { type: "Marketplace", id: "MY_LIST" },
        { type: "Marketplace", id: "SAVED_LIST" },
      ],
    }),

    toggleMarketplaceFavorite: builder.mutation<
      { ok: boolean; saved: boolean },
      string
    >({
      query: (itemId) => ({
        url: `/marketplace/favorites/${itemId}`,
        method: "POST",
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: (_result, _error, itemId) => [
        { type: "Marketplace", id: itemId },
        { type: "Marketplace", id: "SAVED_LIST" },
      ],
    }),

    reportMarketplaceItem: builder.mutation<
      { ok: boolean },
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/marketplace/reports/${id}`,
        method: "POST",
        data: { reason },
      }),
      transformResponse: (response: any) => response?.data || response,
    }),

    recordMarketplaceView: builder.mutation<{ ok: boolean }, string>({
      query: (itemId) => ({
        url: `/marketplace/views/${itemId}`,
        method: "POST",
      }),
      transformResponse: (response: any) => response?.data || response,
    }),

    getMarketplaceChat: builder.query<
      MarketplaceChatMessage[],
      { itemId: string; buyerId?: string }
    >({
      query: ({ itemId, buyerId }) => ({
        url: `/marketplace/chat/${itemId}`,
        method: "GET",
        params: buyerId ? { buyer_id: buyerId } : undefined,
      }),
      transformResponse: (response: any) => response?.data || response || [],
    }),

    getMarketplaceChatThreads: builder.query<
      MarketplaceChatThread[],
      string
    >({
      query: (itemId) => ({
        url: `/marketplace/chat/${itemId}/threads`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response || [],
    }),

    sendMarketplaceChat: builder.mutation<
      { ok: boolean },
      { itemId: string; message: string; receiver_id?: string }
    >({
      query: ({ itemId, message, receiver_id }) => ({
        url: `/marketplace/chat/${itemId}`,
        method: "POST",
        data: { message, receiver_id },
      }),
      transformResponse: (response: any) => response?.data || response,
    }),
  }),
});

export const {
  useGetMarketplaceCategoriesQuery,
  useGetMarketplaceItemsQuery,
  useGetMyMarketplaceItemsQuery,
  useGetSavedMarketplaceItemsQuery,
  useCreateMarketplaceItemMutation,
  useUpdateMarketplaceItemMutation,
  useDeleteMarketplaceItemMutation,
  useToggleMarketplaceFavoriteMutation,
  useReportMarketplaceItemMutation,
  useRecordMarketplaceViewMutation,
  useGetMarketplaceChatQuery,
  useLazyGetMarketplaceChatQuery,
  useGetMarketplaceChatThreadsQuery,
  useLazyGetMarketplaceChatThreadsQuery,
  useSendMarketplaceChatMutation,
} = marketplaceApi;
