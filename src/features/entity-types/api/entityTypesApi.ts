import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  EntityType,
  CreateEntityTypePayload,
  UpdateEntityTypePayload,
} from "../types";

interface EntityTypeMutationResult {
  ok: boolean;
}

export const entityTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntityTypes: builder.query<EntityType[], void>({
      query: () => ({
        url: "/admin/entity-types",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<EntityType>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "EntityTypes" as const, id })),
              { type: "EntityTypes", id: "LIST" },
            ]
          : [{ type: "EntityTypes", id: "LIST" }],
    }),

    createEntityType: builder.mutation<EntityType, CreateEntityTypePayload>({
      query: (data) => ({
        url: "/admin/entity-types",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<EntityType>(response as EntityType),
      invalidatesTags: [{ type: "EntityTypes", id: "LIST" }],
    }),

    updateEntityType: builder.mutation<
      { ok: boolean },
      { id: string; data: UpdateEntityTypePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/entity-types/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EntityTypeMutationResult>(response as EntityTypeMutationResult),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "EntityTypes", id },
        { type: "EntityTypes", id: "LIST" },
      ],
    }),

    deleteEntityType: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/admin/entity-types/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EntityTypeMutationResult>(response as EntityTypeMutationResult),
      invalidatesTags: [{ type: "EntityTypes", id: "LIST" }],
    }),
  }),
});

export const {
  useGetEntityTypesQuery,
  useCreateEntityTypeMutation,
  useUpdateEntityTypeMutation,
  useDeleteEntityTypeMutation,
} = entityTypesApi;
