import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  Permission,
  PermissionCreatePayload,
  PermissionUpdatePayload,
  RolePermissionSummary,
  RolePermissionMatrixResponse,
  BulkPermissionPayload,
} from "../types";

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<Permission[], void>({
      query: () => ({
        url: "/admin/permissions",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<Permission>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Permissions" as const,
                id,
              })),
              { type: "Permissions", id: "LIST" },
            ]
          : [{ type: "Permissions", id: "LIST" }],
    }),

    getRolesPermissionsSummary: builder.query<RolePermissionSummary[], void>({
      query: () => ({
        url: "/admin/roles-permissions-summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<RolePermissionSummary>(response),
      providesTags: [{ type: "Permissions", id: "LIST" }, { type: "Roles", id: "LIST" }],
    }),

    getRolePermissionsMatrix: builder.query<RolePermissionMatrixResponse, string>({
      query: (roleId) => ({
        url: `/admin/roles/${roleId}/permissions-matrix`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiData<RolePermissionMatrixResponse>(response as RolePermissionMatrixResponse),
      providesTags: (_result, _error, roleId) => [
        { type: "Permissions", id: `ROLE_${roleId}` },
      ],
    }),

    updateRolePermissionsBulk: builder.mutation<
      { ok: boolean; message: string },
      BulkPermissionPayload
    >({
      query: ({ role_id, permissions }) => ({
        url: `/admin/roles/${role_id}/permissions-bulk`,
        method: "POST",
        data: { permissions },
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean; message: string }>(response as { ok: boolean; message: string }),
      invalidatesTags: (_result, _error, { role_id }) => [
        { type: "Permissions", id: `ROLE_${role_id}` },
        { type: "Permissions", id: "LIST" },
      ],
    }),

    createPermission: builder.mutation<Permission, PermissionCreatePayload>({
      query: (data) => ({
        url: "/admin/permissions",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<Permission>(response as Permission),
      invalidatesTags: [{ type: "Permissions", id: "LIST" }],
    }),

    updatePermission: builder.mutation<
      Permission,
      { id: string; data: PermissionUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/permissions/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<Permission>(response as Permission),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Permissions", id },
        { type: "Permissions", id: "LIST" },
      ],
    }),

    deletePermission: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/admin/permissions/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Permissions", id },
        { type: "Permissions", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetRolesPermissionsSummaryQuery,
  useGetRolePermissionsMatrixQuery,
  useUpdateRolePermissionsBulkMutation,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionsApi;
