import baseApi from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  SystemUser,
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
} from "../types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<SystemUser[], void>({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<SystemUser>(response),
      providesTags: ["Users"],
    }),

    createUser: builder.mutation<
      { ok: boolean; message: string; activation_code?: string },
      AdminCreateUserPayload
    >({
      query: (data) => ({
        url: "/admin/users",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; message: string; activation_code?: string }>(response),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation<
      { ok: boolean; message: string },
      { userId: string; data: AdminUpdateUserPayload }
    >({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; message: string }>(response),
      invalidatesTags: ["Users"],
    }),

    sendActivationCode: builder.mutation<
      { ok: boolean; message: string },
      string
    >({
      query: (userId) => ({
        url: `/admin/users/${userId}/send-code`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; message: string }>(response),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useSendActivationCodeMutation,
} = usersApi;
