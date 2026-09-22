import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";

export interface RenderedEmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export type EmailTemplatePreview = {
  registration: RenderedEmailTemplate;
  password_reset: RenderedEmailTemplate;
  password_reset_otp: RenderedEmailTemplate;
};

export const emailTemplatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailTemplatePreviews: builder.query<EmailTemplatePreview, void>({
      query: () => ({
        url: "/admin/associations/email-templates",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<EmailTemplatePreview>(response as EmailTemplatePreview),
    }),
  }),
});

export const { useGetEmailTemplatePreviewsQuery } = emailTemplatesApi;
