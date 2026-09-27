import { DEFAULT_EMAIL_TEMPLATE_CONTEXT } from "../constants";

const PLACEHOLDER_PATTERN = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;

export const renderEmailTemplate = (
  content: string,
  context: Record<string, string> = DEFAULT_EMAIL_TEMPLATE_CONTEXT,
): string =>
  content.replace(PLACEHOLDER_PATTERN, (placeholder, key: string) => {
    return context[key] ?? placeholder;
  });
