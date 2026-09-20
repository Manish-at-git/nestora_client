import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type { Feature, FeaturePayload } from "../types";

export const featuresApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeatures: builder.query<Feature[], void>({
      query: () => ({
        url: "/admin/features",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<Feature>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Features" as const, id })),
              { type: "Features", id: "LIST" },
            ]
          : [{ type: "Features", id: "LIST" }],
    }),

    createFeature: builder.mutation<Feature, FeaturePayload>({
      query: (data) => ({
        url: "/admin/features",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<Feature>(response as Feature),
      invalidatesTags: [{ type: "Features", id: "LIST" }],
    }),

    updateFeature: builder.mutation<
      { ok: boolean },
      { id: string; data: FeaturePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/features/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Features", id },
        { type: "Features", id: "LIST" },
      ],
    }),

    deleteFeature: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/admin/features/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Features", id },
        { type: "Features", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeaturesQuery,
  useCreateFeatureMutation,
  useUpdateFeatureMutation,
  useDeleteFeatureMutation,
} = featuresApi;
