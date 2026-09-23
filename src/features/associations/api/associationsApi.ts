import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  Association,
  AssociationStats,
  AssociationSubscriptionPayload,
} from "../types";

export const associationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssociations: builder.query<Association[], void>({
      query: () => ({
        url: "/admin/associations",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<Association>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Associations" as const,
                id,
              })),
              { type: "Associations", id: "LIST" },
            ]
          : [{ type: "Associations", id: "LIST" }],
    }),

    getAssociationStats: builder.query<AssociationStats, string>({
      query: (id) => ({
        url: `/admin/associations/${id}/stats`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiData<AssociationStats>(response as AssociationStats),
    }),

    updateAssociationSubscription: builder.mutation<
      { ok: boolean },
      { id: string; data: AssociationSubscriptionPayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/associations/${id}/subscription`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Associations", id },
        { type: "Associations", id: "LIST" },
      ],
    }),

    onboardAssociation: builder.mutation<
      { ok: boolean; message?: string },
      FormData
    >({
      query: (formData) => ({
        url: "/admin/associations/onboard",
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; message?: string }>(response as { ok: boolean; message?: string }),
      invalidatesTags: [
        { type: "Associations", id: "LIST" },
        { type: "Entities", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAssociationsQuery,
  useGetAssociationStatsQuery,
  useUpdateAssociationSubscriptionMutation,
  useOnboardAssociationMutation,
} = associationsApi;
