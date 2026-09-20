import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type {
  Employee,
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
} from "../types";

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => ({
        url: "/admin/employees",
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapApiList<Employee>(response),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ account_id }) => ({
                type: "Employees" as const,
                id: account_id,
              })),
              { type: "Employees", id: "LIST" },
            ]
          : [{ type: "Employees", id: "LIST" }],
    }),

    createEmployee: builder.mutation<
      { ok: boolean; account_id: string; temp_password?: string },
      EmployeeCreatePayload
    >({
      query: (data) => ({
        url: "/admin/employees",
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ ok: boolean; account_id: string; temp_password?: string }>(response),
      invalidatesTags: [{ type: "Employees", id: "LIST" }],
    }),

    updateEmployee: builder.mutation<
      { ok: boolean },
      { account_id: string; data: EmployeeUpdatePayload }
    >({
      query: ({ account_id, data }) => ({
        url: `/admin/employees/${account_id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) => unwrapApiData<{ ok: boolean }>(response),
      invalidatesTags: (_result, _error, { account_id }) => [
        { type: "Employees", id: account_id },
        { type: "Employees", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} = employeesApi;
