import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorDetail } from "@/types/api";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL

export const API_BASE_URL = `${BACKEND_URL}/api`;
const CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME || "nestora_csrf";
const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

const GENERIC_API_ERROR = "Something went wrong. Please try again.";
const SERVICE_UNAVAILABLE_ERROR = "The service is temporarily unavailable. Please try again later.";

const isHtmlDocument = (value: string): boolean => /<\s*(!doctype|html|head|body)\b/i.test(value);
/**
 * Session cookies are HttpOnly, so the API client keeps only an in-memory
 * authenticated flag. Protected requests are rejected locally until the auth
 * bootstrap has confirmed a session; public bootstrap endpoints remain usable.
 */
let hasAuthenticatedSession = false;

const PUBLIC_API_PATHS = [
  "/auth/me",
  "/auth/login",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/reset-password",
  // Password-reset OTP routes are registered on the public router without
  // the /auth prefix. Keep both forms public for legacy and modular clients.
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
  "/auth/password-reset/request",
  "/auth/password-reset/verify",
  "/auth/password-reset/confirm",
  "/login-code",
  "/request-code",
  "/user-details",
  "/create-account",
  "/update-details-request",
  "/admin/associations/email-templates",
  // Digital event-pass links are intentionally shareable without a signed-in session.
  "/events/passes/",
];

const isPublicApiRequest = (url = ""): boolean => {
  const path = url.split("?")[0].replace(/^https?:\/\/[^/]+/, "");
  return (
    PUBLIC_API_PATHS.some((publicPath) => path === publicPath || path.endsWith(publicPath)) ||
    path.includes("/public/visitor-passes/") ||
    path.includes("/events/passes/")
  );
};

export const setAuthenticatedSession = (authenticated: boolean): void => {
  hasAuthenticatedSession = authenticated;
};

export const isAuthenticatedSession = (): boolean => hasAuthenticatedSession;

/** Read only the deliberately non-HttpOnly CSRF cookie; session cookies remain inaccessible to JavaScript. */
const getCookieValue = (name: string): string | undefined => {
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);
};

/** A CSRF cookie is issued alongside the authenticated session cookie. */
export const hasSessionCookieHint = (): boolean => Boolean(getCookieValue(CSRF_COOKIE_NAME));

export const formatApiErrorDetail = (detail: ApiErrorDetail | any): string => {
  if (detail == null) return GENERIC_API_ERROR;
  // Hosting providers and proxies may return an HTML error page instead of
  // our API envelope. Never place that document in the application UI.
  if (typeof detail === "string") {
    return isHtmlDocument(detail) ? SERVICE_UNAVAILABLE_ERROR : detail;
  }
  if (typeof detail.message === "string") return formatApiErrorDetail(detail.message);
  if (detail.detail != null) return formatApiErrorDetail(detail.detail);
  if (Array.isArray(detail))
    return detail
      .map((error) => formatApiErrorDetail(error))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return formatApiErrorDetail(detail.msg);
  return GENERIC_API_ERROR;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Required for the browser to store and send the HttpOnly session cookie.
  withCredentials: true,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Add double-submit CSRF protection to cookie-authenticated writes.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!isPublicApiRequest(config.url) && !hasAuthenticatedSession) {
      const error = new Error("Authentication is required before calling this API") as Error & {
        code?: string;
      };
      error.code = "AUTH_REQUIRED";
      return Promise.reject(error);
    }
    const method = config.method?.toLowerCase();
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (method && UNSAFE_METHODS.has(method) && csrfToken && config.headers) {
      config.headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Send unauthenticated visitors away from protected client routes.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error?.code === "AUTH_REQUIRED") {
      return Promise.reject(error);
    }
    const responseData = error.response?.data as
      | { message?: string; detail?: unknown }
      | undefined;
    const serverMessage =
      responseData?.message ||
      (typeof responseData?.detail === "string" ? responseData.detail : undefined);

    // Development diagnostics remain available in the browser console and Network
    // response, without exposing server debug details in the application UI.
    if (import.meta.env.DEV) {
      console.error("[API error]", {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        message: serverMessage || error.message,
        response: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicPaths = ["/", "/signin", "/verify", "/create-account", "/forgot-password", "/reset-password"];
      const isPublicPath =
        publicPaths.includes(currentPath) ||
        currentPath.startsWith("/visitor-pass/");

      if (!isPublicPath) {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
