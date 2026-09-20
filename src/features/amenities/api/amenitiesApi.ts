import { baseApi } from "@/services/api/baseApi";
import type {
  Amenity,
  AmenityBooking,
  MonthBookingSlot,
  AmenityCreateInput,
  AmenityBookingInput,
} from "../types";

export const amenitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAmenities: builder.query<Amenity[], string | number | undefined>({
      query: (associationId) => ({
        url: `/associations/${associationId}/amenities`,
      }),
      transformResponse: (response: { success: boolean; data?: Amenity[] }) => response.data || [],
      providesTags: ["Amenities"],
    }),

    getAdminAmenities: builder.query<Amenity[], string | number | undefined>({
      query: (associationId) => ({
        url: `/admin/associations/${associationId}/amenities`,
      }),
      transformResponse: (response: { success: boolean; data?: Amenity[] }) => response.data || [],
      providesTags: ["Amenities"],
    }),

    createAmenity: builder.mutation<
      { ok: boolean; id: string | number; message: string },
      { associationId: string | number; data: AmenityCreateInput }
    >({
      query: ({ associationId, data }) => ({
        url: `/admin/associations/${associationId}/amenities`,
        method: "POST",
        data: {
          name: data.name,
          charges: data.charges,
          status: data.status !== undefined ? data.status : true,
        },
      }),
      transformResponse: (response: { success: boolean; message: string; data?: { id: string } }) => ({
        ok: response.success,
        id: response.data?.id || "",
        message: response.message,
      }),
      invalidatesTags: ["Amenities"],
    }),

    updateAmenityStatus: builder.mutation<
      { ok: boolean; message: string },
      { associationId: string | number; amenityId: string | number; status: boolean }
    >({
      query: ({ associationId, amenityId, status }) => ({
        url: `/admin/associations/${associationId}/amenities/${amenityId}`,
        method: "PUT",
        data: { status },
      }),
      transformResponse: (response: { success: boolean; message: string }) => ({
        ok: response.success,
        message: response.message,
      }),
      invalidatesTags: ["Amenities"],
    }),

    deleteAmenity: builder.mutation<
      { ok: boolean; message: string },
      { associationId: string | number; amenityId: string | number }
    >({
      query: ({ associationId, amenityId }) => ({
        url: `/admin/associations/${associationId}/amenities/${amenityId}`,
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; message: string }) => ({
        ok: response.success,
        message: response.message,
      }),
      invalidatesTags: ["Amenities"],
    }),

    getAmenityMonthBookings: builder.query<
      MonthBookingSlot[],
      { amenityId: string | number; month: string }
    >({
      query: ({ amenityId, month }) => ({
        url: `/amenities/${amenityId}/bookings`,
        params: { month },
      }),
      transformResponse: (response: { success: boolean; data?: MonthBookingSlot[] }) => response.data || [],
      providesTags: ["Amenities"],
    }),

    getMyBookings: builder.query<AmenityBooking[], void>({
      query: () => ({
        url: "/amenities/my-bookings",
      }),
      transformResponse: (response: { success: boolean; data?: AmenityBooking[] }) => response.data || [],
      providesTags: ["Amenities"],
    }),

    getAssociationBookings: builder.query<AmenityBooking[], string | number | undefined>({
      query: (associationId) => ({
        url: `/admin/associations/${associationId || "ALL"}/amenity-bookings`,
      }),
      transformResponse: (response: { success: boolean; data?: AmenityBooking[] }) => response.data || [],
      providesTags: ["Amenities"],
    }),

    bookAmenity: builder.mutation<
      { ok: boolean; booking_id: string | number; message: string },
      { amenityId: string | number; payload: AmenityBookingInput }
    >({
      query: ({ amenityId, payload }) => ({
        url: `/amenities/${amenityId}/book`,
        method: "POST",
        data: payload,
      }),
      transformResponse: (response: { success: boolean; message: string; data?: { booking_id: string } }) => ({
        ok: response.success,
        booking_id: response.data?.booking_id || "",
        message: response.message,
      }),
      invalidatesTags: ["Amenities", "Wallet"],
    }),
  }),
});

export const {
  useGetAmenitiesQuery,
  useGetAdminAmenitiesQuery,
  useCreateAmenityMutation,
  useUpdateAmenityStatusMutation,
  useDeleteAmenityMutation,
  useGetAmenityMonthBookingsQuery,
  useLazyGetAmenityMonthBookingsQuery,
  useGetMyBookingsQuery,
  useGetAssociationBookingsQuery,
  useBookAmenityMutation,
} = amenitiesApi;
