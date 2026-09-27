import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  EmailTemplate,
  EmailTemplateMutationResult,
  EmailTemplatePayload,
  EmailTemplateTestPayload,
  EmailTemplateTestResult,
} from "../types";

export const emailTemplatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailTemplates: builder.query<EmailTemplate[], void>({
      query: () => ({
        url: "/admin/email-templates",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiList<EmailTemplate>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "EmailTemplates" as const,
                id,
              })),
              { type: "EmailTemplates", id: "LIST" },
            ]
          : [{ type: "EmailTemplates", id: "LIST" }],
    }),

    createEmailTemplate: builder.mutation<EmailTemplate, EmailTemplatePayload>({
      query: (data) => ({
        url: "/admin/email-templates",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EmailTemplate>(response as EmailTemplate),
      invalidatesTags: [{ type: "EmailTemplates", id: "LIST" }],
    }),

    updateEmailTemplate: builder.mutation<
      EmailTemplateMutationResult,
      { id: string; data: EmailTemplatePayload }
    >({
      query: ({ id, data }) => ({
        url: "/admin/email-templates/" + id,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EmailTemplateMutationResult>(
          response as EmailTemplateMutationResult,
        ),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "EmailTemplates", id },
        { type: "EmailTemplates", id: "LIST" },
      ],
    }),

    deleteEmailTemplate: builder.mutation<EmailTemplateMutationResult, string>({
      query: (id) => ({
        url: "/admin/email-templates/" + id,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EmailTemplateMutationResult>(
          response as EmailTemplateMutationResult,
        ),
      invalidatesTags: [{ type: "EmailTemplates", id: "LIST" }],
    }),

    sendEmailTemplateTest: builder.mutation<
      EmailTemplateTestResult,
      { id: string; data: EmailTemplateTestPayload }
    >({
      query: ({ id, data }) => ({
        url: "/admin/email-templates/" + id + "/test",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EmailTemplateTestResult>(
          response as EmailTemplateTestResult,
        ),
    }),
  }),
});

export const {
  useGetEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  useSendEmailTemplateTestMutation,
} = emailTemplatesApi;
