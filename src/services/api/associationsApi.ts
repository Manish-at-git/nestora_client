import { baseApi } from "./baseApi";

export interface AssociationOption {
  id: string | number;
  name: string;
  allowed_features?: string[];
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
          allowed_features: Array.isArray(a.allowed_features) ? a.allowed_features : [],
        }));
      },
      providesTags: [{ type: "Associations", id: "LIST" }],
    }),
  }),
});

export const { useGetAdminAssociationsQuery } = associationsApi;
