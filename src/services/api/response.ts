/** Helpers for consuming the server response envelope during incremental migration. */

export interface ApiResponse<T> {
  data: T;
}

/** Unwrap a new server response while remaining compatible with legacy raw payloads. */
export const unwrapApiData = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
};

/** Return a safe list for screens that must tolerate an absent or malformed response. */
export const unwrapApiList = <T>(response: ApiResponse<T[]> | T[] | unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as ApiResponse<T[]>).data)
  ) {
    return (response as ApiResponse<T[]>).data;
  }
  return [];
};
