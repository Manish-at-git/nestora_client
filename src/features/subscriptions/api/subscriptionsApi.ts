import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  SubscriptionPlan,
  SubscriptionPlanCreatePayload,
  SubscriptionPlanUpdatePayload,
  SetPlanFeaturesPayload,
} from "../types";

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => ({
        url: "/admin/subscription-plans",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<SubscriptionPlan>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "SubscriptionPlans" as const,
                id,
              })),
              { type: "SubscriptionPlans", id: "LIST" },
            ]
          : [{ type: "SubscriptionPlans", id: "LIST" }],
    }),

    createSubscriptionPlan: builder.mutation<
      { ok: boolean; id: string },
      SubscriptionPlanCreatePayload
    >({
      query: (data) => ({
        url: "/admin/subscription-plans",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; id: string }>(response as { ok: boolean; id: string }),
      invalidatesTags: [{ type: "SubscriptionPlans", id: "LIST" }],
    }),

    updateSubscriptionPlan: builder.mutation<
      { ok: boolean },
      { id: string; data: SubscriptionPlanUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/subscription-plans/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "SubscriptionPlans", id },
        { type: "SubscriptionPlans", id: "LIST" },
      ],
    }),

    deleteSubscriptionPlan: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/admin/subscription-plans/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, id) => [
        { type: "SubscriptionPlans", id },
        { type: "SubscriptionPlans", id: "LIST" },
      ],
    }),

    setSubscriptionPlanFeatures: builder.mutation<
      { ok: boolean },
      SetPlanFeaturesPayload
    >({
      query: ({ plan_id, feature_ids }) => ({
        url: `/admin/subscription-plans/${plan_id}/features`,
        method: "POST",
        data: { feature_ids },
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean }>(response as { ok: boolean }),
      invalidatesTags: (_result, _error, { plan_id }) => [
        { type: "SubscriptionPlans", id: plan_id },
        { type: "SubscriptionPlans", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useSetSubscriptionPlanFeaturesMutation,
} = subscriptionsApi;
