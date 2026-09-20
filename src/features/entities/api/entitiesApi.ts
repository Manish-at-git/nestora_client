import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  Entity,
  CreateEntityPayload,
  UpdateEntityPayload,
} from "../types";
import type { EntityType } from "@/features/entity-types/types";

interface EntityMutationResult {
  ok: boolean;
}

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntities: builder.query<Entity[], void>({
      query: () => ({
        url: "/admin/entities",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<Entity>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Entities" as const, id })),
              { type: "Entities", id: "LIST" },
            ]
          : [{ type: "Entities", id: "LIST" }],
    }),

    createEntity: builder.mutation<Entity, CreateEntityPayload>({
      query: (data) => ({
        url: "/admin/entities",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<Entity>(response as Entity),
      invalidatesTags: [{ type: "Entities", id: "LIST" }],
    }),

    updateEntity: builder.mutation<
      { ok: boolean },
      { id: string; data: UpdateEntityPayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/entities/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EntityMutationResult>(response as EntityMutationResult),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Entities", id },
        { type: "Entities", id: "LIST" },
      ],
    }),

    deleteEntity: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/admin/entities/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EntityMutationResult>(response as EntityMutationResult),
      invalidatesTags: [{ type: "Entities", id: "LIST" }],
    }),

    getEntityTypesForEntities: builder.query<EntityType[], void>({
      query: () => ({
        url: "/admin/entity-types",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<EntityType>(response),
      providesTags: [{ type: "EntityTypes", id: "LIST" }],
    }),

    getAdminAssociationsForEntities: builder.query<
      Array<{ id: string; name: string }>,
      void
    >({
      query: () => ({
        url: "/admin/associations",
        method: "GET",
      }),
      providesTags: [{ type: "Associations", id: "LIST" }],
    }),
  }),
});

export const {
  useGetEntitiesQuery,
  useCreateEntityMutation,
  useUpdateEntityMutation,
  useDeleteEntityMutation,
  useGetEntityTypesForEntitiesQuery,
  useGetAdminAssociationsForEntitiesQuery,
} = entitiesApi;
