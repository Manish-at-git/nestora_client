import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";
import type { Account, UserProfile } from "@/types/auth";

export interface LoginResponse {
  token?: string;
  account: Account;
  profile?: UserProfile;
}

export interface UserDetailsResponse {
  name: string;
  email: string;
  contact_number: string;
  address: string;
  role?: string;
  association_id?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<{ account: Account; profile: UserProfile }, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth", "UserProfile"],
    }),
    loginCode: builder.mutation<{ already_registered: boolean; ok?: boolean }, { code: string }>({
      query: (body) => ({
        url: "/login-code",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ already_registered: boolean; ok?: boolean }>(response as { already_registered: boolean; ok?: boolean }),
    }),
    requestCode: builder.mutation<
      { ok: boolean; message?: string },
      { name: string; email: string; contact_number: string }
    >({
      query: (body) => ({
        url: "/request-code",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; message?: string }>(response as { ok: boolean; message?: string }),
    }),
    getUserDetails: builder.query<UserDetailsResponse, string>({
      query: (code) => ({
        url: `/user-details`,
        method: "GET",
        params: { code },
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<UserDetailsResponse>(response as UserDetailsResponse),
    }),
    createAccount: builder.mutation<
      LoginResponse,
      { code: string; email: string; password: string; confirm_password?: string }
    >({
      query: (body) => ({
        url: "/create-account",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<LoginResponse>(response as LoginResponse),
      invalidatesTags: ["Auth", "UserProfile"],
    }),
    updateDetailsRequest: builder.mutation<
      { ok: boolean; message?: string },
      {
        code: string;
        requested_name?: string;
        requested_address?: string;
        requested_email?: string;
        requested_contact?: string;
        note?: string;
      }
    >({
      query: (body) => ({
        url: "/update-details-request",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; message?: string }>(
          response as { ok: boolean; message?: string }
        ),
    }),
    requestPasswordReset: builder.mutation<{ accepted: boolean }, { email: string }>({
      query: (body) => ({ url: "/forgot-password", method: "POST", data: body }),
      transformResponse: (response: unknown) => unwrapApiData<{ accepted: boolean }>(response as { accepted: boolean }),
    }),
    verifyPasswordResetOtp: builder.mutation<{ valid: boolean }, { email: string; otp: string }>({
      query: (body) => ({ url: "/verify-otp", method: "POST", data: body }),
      transformResponse: (response: unknown) => unwrapApiData<{ valid: boolean }>(response as { valid: boolean }),
    }),
    resetPassword: builder.mutation<{ password_updated: boolean }, { email: string; otp: string; new_password: string }>({
      query: (body) => ({ url: "/reset-password", method: "POST", data: body }),
      transformResponse: (response: unknown) => unwrapApiData<{ password_updated: boolean }>(response as { password_updated: boolean }),
    }),
    verifyPasswordResetToken: builder.mutation<{ valid: boolean }, { token: string }>({
      query: (body) => ({ url: "/auth/password-reset/verify", method: "POST", data: body }),
      transformResponse: (response: unknown) => unwrapApiData<{ valid: boolean }>(response as any),
    }),
    confirmPasswordResetToken: builder.mutation<{ password_updated: boolean }, { token: string; password: string }>({
      query: (body) => ({ url: "/auth/password-reset/confirm", method: "POST", data: body }),
      transformResponse: (response: unknown) => unwrapApiData<{ password_updated: boolean }>(response as any),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginCodeMutation,
  useRequestCodeMutation,
  useGetUserDetailsQuery,
  useCreateAccountMutation,
  useUpdateDetailsRequestMutation,
  useRequestPasswordResetMutation,
  useVerifyPasswordResetOtpMutation,
  useResetPasswordMutation,
  useVerifyPasswordResetTokenMutation,
  useConfirmPasswordResetTokenMutation,
} = authApi;
