import { baseApi } from "@/services/api/baseApi";
import type { ActiveViolationFine, EligibleResident, Violation, ViolationMessage } from "../types";

interface ApiResponse<T> { success: boolean; message: string; data: T }
interface ViolationFineDefault { amount: string | number | null }

export const violationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getViolations: builder.query<Violation[], { scope: string; association_id?: string }>(
      { query: (params) => ({ url: "/violations", params }), transformResponse: (response: ApiResponse<Violation[]>) => response.data || [], providesTags: [{ type: "Violations", id: "LIST" }] }
    ),
    getEligibleViolationResidents: builder.query<EligibleResident[], void>(
      { query: () => ({ url: "/violations/eligible-residents" }), transformResponse: (response: ApiResponse<EligibleResident[]>) => response.data || [] }
    ),
    getViolationFineDefault: builder.query<ViolationFineDefault, string>(
      { query: (id) => ({ url: `/violations/${id}/fine-default` }), transformResponse: (response: ApiResponse<ViolationFineDefault>) => response.data }
    ),
    getHomeownerActiveViolationFines: builder.query<ActiveViolationFine[], void>(
      { query: () => ({ url: "/violations/dues" }), transformResponse: (response: ApiResponse<ActiveViolationFine[]>) => response.data || [], providesTags: [{ type: "Violations", id: "DUES" }] }
    ),
    createViolation: builder.mutation<{ id: string }, Record<string, unknown>>(
      { query: (data) => ({ url: "/violations", method: "POST", data }), transformResponse: (response: ApiResponse<{ id: string }>) => response.data, invalidatesTags: [{ type: "Violations", id: "LIST" }] }
    ),
    adminReviewViolation: builder.mutation<void, { id: string; data: Record<string, unknown> }>(
      { query: ({ id, data }) => ({ url: `/violations/${id}/admin-review`, method: "PATCH", data }), invalidatesTags: [{ type: "Violations", id: "LIST" }] }
    ),
    boardDecideViolation: builder.mutation<void, { id: string; data: Record<string, unknown> }>(
      { query: ({ id, data }) => ({ url: `/violations/${id}/board-decision`, method: "PATCH", data }), invalidatesTags: [{ type: "Violations", id: "LIST" }] }
    ),
    respondToViolation: builder.mutation<void, { id: string; response: string }>(
      { query: ({ id, response }) => ({ url: `/violations/${id}/response`, method: "POST", data: { response } }), invalidatesTags: [{ type: "Violations", id: "LIST" }, { type: "Violations", id: "DUES" }] }
    ),
    getViolationMessages: builder.query<ViolationMessage[], string>(
      { query: (id) => ({ url: `/violations/${id}/messages` }), transformResponse: (response: ApiResponse<ViolationMessage[]>) => response.data || [], providesTags: (_r, _e, id) => [{ type: "Violations", id: `MESSAGES_${id}` }] }
    ),
    sendViolationMessage: builder.mutation<void, { id: string; body: string; attachment_url?: string }>(
      { query: ({ id, ...data }) => ({ url: `/violations/${id}/messages`, method: "POST", data }), invalidatesTags: (_r, _e, { id }) => [{ type: "Violations", id: `MESSAGES_${id}` }] }
    ),
  }),
});

export const {
  useGetViolationsQuery,
  useGetEligibleViolationResidentsQuery,
  useGetViolationFineDefaultQuery,
  useGetHomeownerActiveViolationFinesQuery,
  useCreateViolationMutation,
  useAdminReviewViolationMutation,
  useBoardDecideViolationMutation,
  useRespondToViolationMutation,
  useGetViolationMessagesQuery,
  useSendViolationMessageMutation,
} = violationsApi;
