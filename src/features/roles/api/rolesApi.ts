import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type { Role, RolePayload, EntityOption } from "../types";

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
      query: () => ({
        url: "/admin/roles",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<Role>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Roles" as const, id })),
              { type: "Roles", id: "LIST" },
            ]
          : [{ type: "Roles", id: "LIST" }],
    }),

    getEntitiesForRoles: builder.query<EntityOption[], void>({
      query: () => ({
        url: "/admin/entities",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<EntityOption>(response),
      providesTags: [{ type: "Entities", id: "LIST" }],
    }),

    createRole: builder.mutation<Role, RolePayload>({
      query: (data) => ({
        url: "/admin/roles",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<Role>(response as Role),
      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),

    updateRole: builder.mutation<
      { ok: boolean },
      { id: string; data: RolePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/roles/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Roles", id },
        { type: "Roles", id: "LIST" },
      ],
    }),

    deleteRole: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/admin/roles/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Roles", id },
        { type: "Roles", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRolesQuery,
  useGetEntitiesForRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
