export interface EmailTemplate {
  id: string;
  name: string;
  event_type: string;
  subject: string;
  body: string;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EmailTemplatePayload {
  name: string;
  event_type: string;
  subject: string;
  body: string;
  is_active: boolean;
}

export interface EmailTemplateTestPayload {
  test_email: string;
  sample_context?: Record<string, string>;
}

export interface EmailTemplateMutationResult {
  ok: boolean;
}

export interface EmailTemplateTestResult {
  ok: boolean;
  provider?: string | null;
}
