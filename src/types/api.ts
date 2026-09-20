export interface ApiErrorObject {
  msg?: string;
  type?: string;
  loc?: (string | number)[];
}

export type ApiErrorDetail = string | ApiErrorObject | ApiErrorObject[] | null | undefined;

export interface ApiResponse<T = unknown> {
  ok?: boolean;
  data?: T;
  message?: string;
  total?: number;
}
