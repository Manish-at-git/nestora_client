import { baseApi } from "@/services/api/baseApi";
import { unwrapApiData } from "@/services/api/response";
import type {
  ProfileData,
  UserDetails,
  Vehicle,
  VehicleFormData,
  Pet,
  PetFormData,
  Education,
  EducationFormData,
  Experience,
  ExperienceFormData,
} from "../types";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfileData: builder.query<ProfileData, void>({
      query: () => ({
        url: "/profile/data",
        method: "GET",
      }),
      transformResponse: (response: unknown) => {
        const res = unwrapApiData<Record<string, any>>(response as Record<string, any>);
        return {
          ok: res?.ok,
          user_details: res?.user_details || {},
          family_members: res?.family_members || [],
          unit_homeowners: res?.unit_homeowners || [],
          vehicles: res?.vehicles || [],
          pets: res?.pets || [],
          education: res?.education || [],
          experience: res?.experience || [],
          association_name: res?.association_name,
          association_id: res?.association_id,
        };
      },
      providesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    updateUserDetails: builder.mutation<{ ok: boolean }, Partial<UserDetails>>({
      query: (body) => ({
        url: "/profile/user-details",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [
        { type: "UserProfile", id: "DATA" },
        { type: "Auth" },
      ],
    }),

    // Vehicle endpoints
    addVehicle: builder.mutation<Vehicle, VehicleFormData>({
      query: (body) => ({
        url: "/profile/vehicles",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    updateVehicle: builder.mutation<Vehicle, { id: string | number; data: Partial<VehicleFormData> }>({
      query: ({ id, data }) => ({
        url: `/profile/vehicles/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    deleteVehicle: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/profile/vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    // Pet endpoints
    addPet: builder.mutation<Pet, PetFormData>({
      query: (body) => ({
        url: "/profile/pets",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    updatePet: builder.mutation<Pet, { id: string | number; data: Partial<PetFormData> }>({
      query: ({ id, data }) => ({
        url: `/profile/pets/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    deletePet: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/profile/pets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    // Education endpoints
    addEducation: builder.mutation<Education, EducationFormData>({
      query: (body) => ({
        url: "/profile/education",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    updateEducation: builder.mutation<Education, { id: string | number; data: Partial<EducationFormData> }>({
      query: ({ id, data }) => ({
        url: `/profile/education/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    deleteEducation: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/profile/education/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    // Experience endpoints
    addExperience: builder.mutation<Experience, ExperienceFormData>({
      query: (body) => ({
        url: "/profile/experience",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    updateExperience: builder.mutation<Experience, { id: string | number; data: Partial<ExperienceFormData> }>({
      query: ({ id, data }) => ({
        url: `/profile/experience/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),

    deleteExperience: builder.mutation<{ ok: boolean }, string | number>({
      query: (id) => ({
        url: `/profile/experience/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "UserProfile", id: "DATA" }],
    }),
  }),
});

export const {
  useGetProfileDataQuery,
  useUpdateUserDetailsMutation,
  useAddVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useAddPetMutation,
  useUpdatePetMutation,
  useDeletePetMutation,
  useAddEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useAddExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} = profileApi;
