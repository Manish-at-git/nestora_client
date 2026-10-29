import baseApi from "@/services/api/baseApi";
import {
  unwrapApiData,
  unwrapApiList,
  type ApiResponse,
} from "@/services/api/response";
import type {
  SystemUser,
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
} from "../types";

interface BlockOption {
  id: string;
  name: string;
}

interface UnitOption {
  id: string;
  unit_number: string;
}

type UserCreateResponse = {
  ok: boolean;
  message: string;
  activation_code?: string;
};

type UserMutationResponse = {
  ok: boolean;
  message: string;
};

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

    getUserAssociationBlocks: builder.query<BlockOption[], string>({
      query: (associationId) => ({
        url: `/admin/users/associations/${associationId}/blocks`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<BlockOption>(response),
    }),

    getUserBlockUnits: builder.query<UnitOption[], string>({
      query: (blockId) => ({
        url: `/admin/users/blocks/${blockId}/units`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<UnitOption>(response),
    }),

    createUser: builder.mutation<
      UserCreateResponse,
      AdminCreateUserPayload
    >({
      query: (data) => ({
        url: "/admin/users",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<UserCreateResponse>(
          response as ApiResponse<UserCreateResponse> | UserCreateResponse
        ),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation<
      UserMutationResponse,
      { userId: string; data: AdminUpdateUserPayload }
    >({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<UserMutationResponse>(
          response as ApiResponse<UserMutationResponse> | UserMutationResponse
        ),
      invalidatesTags: ["Users"],
    }),

    sendActivationCode: builder.mutation<
      UserMutationResponse,
      string
    >({
      query: (userId) => ({
        url: `/admin/users/${userId}/send-code`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<UserMutationResponse>(
          response as ApiResponse<UserMutationResponse> | UserMutationResponse
        ),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserAssociationBlocksQuery,
  useGetUserBlockUnitsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useSendActivationCodeMutation,
} = usersApi;
