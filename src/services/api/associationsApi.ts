import { baseApi } from "./baseApi";

export interface AssociationOption {
  id: string | number;
  name: string;
}

export const associationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAssociations: builder.query<AssociationOption[], void>({
      query: () => ({
        url: "/admin/associations",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const list = Array.isArray(response)
          ? response
          : response?.associations || response?.data || [];
        return list.map((a: any) => ({
          id: a.id || a.association_id,
          name: a.name || a.association_name || `Association ${a.id}`,
        }));
      },
      providesTags: [{ type: "Associations", id: "LIST" }],
    }),
  }),
});

export const { useGetAdminAssociationsQuery } = associationsApi;
