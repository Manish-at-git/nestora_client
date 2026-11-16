import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData, unwrapApiList } from "@/services/api/response";
import type { StaffAttendance, StaffBlock, StaffMember, StaffMonthlyAttendanceReport, StaffPastAttendancePayload, StaffPayload, StaffScanResponse, StaffUnit } from "../types";

type StaffMutation = { id: string; temp_password?: string | null };

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<StaffMember[], void>({
      query: () => ({ url: "/staff", method: "GET" }),
      transformResponse: (response: unknown) => unwrapApiList<StaffMember>(response),
      providesTags: [{ type: "Staff", id: "LIST" }],
    }),
    getStaffAttendance: builder.query<StaffAttendance[], void>({
      query: () => ({ url: "/staff/attendance", method: "GET" }),
      transformResponse: (response: unknown) => unwrapApiList<StaffAttendance>(response),
      providesTags: [{ type: "Staff", id: "ATTENDANCE" }],
    }),
    getStaffAssociationBlocks: builder.query<StaffBlock[], string>({
      query: (associationId) => ({ url: `/staff/lookups/associations/${associationId}/blocks`, method: "GET" }),
      transformResponse: (response: unknown) => unwrapApiList<StaffBlock>(response),
    }),
    getStaffBlockUnits: builder.query<StaffUnit[], string>({
      query: (blockId) => ({ url: `/staff/lookups/blocks/${blockId}/units`, method: "GET" }),
      transformResponse: (response: unknown) => unwrapApiList<StaffUnit>(response),
    }),
    getMonthlyStaffAttendanceReport: builder.query<StaffMonthlyAttendanceReport, { association_id: string; month: string; staff_id?: string; designation?: string }>({
      query: (params) => ({ url: "/staff/reports/monthly", method: "GET", params }),
      transformResponse: (response: unknown) => unwrapApiData<StaffMonthlyAttendanceReport>(response),
      providesTags: [{ type: "Staff", id: "MONTHLY_REPORT" }],
    }),
    createStaff: builder.mutation<StaffMutation, StaffPayload>({
      query: (data) => ({ url: "/staff", method: "POST", data }),
      transformResponse: (response: unknown) => unwrapApiData<StaffMutation>(response),
      invalidatesTags: [{ type: "Staff", id: "LIST" }],
    }),
    updateStaff: builder.mutation<StaffMutation, { id: string; data: StaffPayload }>({
      query: ({ id, data }) => ({ url: `/staff/${id}`, method: "PUT", data }),
      transformResponse: (response: unknown) => unwrapApiData<StaffMutation>(response),
      invalidatesTags: [{ type: "Staff", id: "LIST" }],
    }),
    scanStaffPass: builder.mutation<StaffScanResponse, { pass_code: string; gate?: string }>({
      query: (data) => ({ url: "/staff/attendance/scan", method: "POST", data }),
      transformResponse: (response: unknown) => unwrapApiData<StaffScanResponse>(response),
      invalidatesTags: [{ type: "Staff", id: "LIST" }, { type: "Staff", id: "ATTENDANCE" }],
    }),
    createPastStaffAttendance: builder.mutation<StaffAttendance, StaffPastAttendancePayload>({
      query: (data) => ({ url: "/staff/attendance/past", method: "POST", data }),
      transformResponse: (response: unknown) => unwrapApiData<StaffAttendance>(response),
      invalidatesTags: [{ type: "Staff", id: "LIST" }, { type: "Staff", id: "ATTENDANCE" }],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffAttendanceQuery,
  useGetStaffAssociationBlocksQuery,
  useGetStaffBlockUnitsQuery,
  useGetMonthlyStaffAttendanceReportQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useScanStaffPassMutation,
  useCreatePastStaffAttendanceMutation,
} = staffApi;
