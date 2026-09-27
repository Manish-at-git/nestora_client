import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  NearbyPlace,
  NearbyPlaceMutationResult,
  NearbyPlacePayload,
} from "../types";

export const nearbyPlacesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNearbyPlaces: builder.query<NearbyPlace[], void>({
      query: () => ({ url: "/nearby-places", method: "GET" }),
      transformResponse: (response: unknown) =>
        unwrapApiList<NearbyPlace>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "NearbyPlaces" as const,
                id,
              })),
              { type: "NearbyPlaces", id: "LIST" },
            ]
          : [{ type: "NearbyPlaces", id: "LIST" }],
    }),
    getNearbyPlacesForAdmin: builder.query<NearbyPlace[], void>({
      query: () => ({ url: "/admin/nearby-places", method: "GET" }),
      transformResponse: (response: unknown) =>
        unwrapApiList<NearbyPlace>(response),
      providesTags: [{ type: "NearbyPlaces", id: "LIST" }],
    }),
    createNearbyPlace: builder.mutation<NearbyPlace, NearbyPlacePayload>({
      query: (data) => ({ url: "/admin/nearby-places", method: "POST", data }),
      transformResponse: (response: unknown) =>
        unwrapApiData<NearbyPlace>(response),
      invalidatesTags: [{ type: "NearbyPlaces", id: "LIST" }],
    }),
    updateNearbyPlace: builder.mutation<
      NearbyPlace,
      { id: string; data: Partial<NearbyPlacePayload> }
    >({
      query: ({ id, data }) => ({
        url: "/admin/nearby-places/" + id,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<NearbyPlace>(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "NearbyPlaces", id },
        { type: "NearbyPlaces", id: "LIST" },
      ],
    }),
    deleteNearbyPlace: builder.mutation<NearbyPlaceMutationResult, string>({
      query: (id) => ({ url: "/admin/nearby-places/" + id, method: "DELETE" }),
      transformResponse: (response: unknown) =>
        unwrapApiData<NearbyPlaceMutationResult>(response),
      invalidatesTags: [{ type: "NearbyPlaces", id: "LIST" }],
    }),
  }),
});

export const {
  useGetNearbyPlacesQuery,
  useGetNearbyPlacesForAdminQuery,
  useCreateNearbyPlaceMutation,
  useUpdateNearbyPlaceMutation,
  useDeleteNearbyPlaceMutation,
} = nearbyPlacesApi;
