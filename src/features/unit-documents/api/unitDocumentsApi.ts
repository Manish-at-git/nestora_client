import { baseApi } from "@/services/api/baseApi";
import type {
  CreateUnitDocumentPayload,
  UnitDocumentRecord,
  UnitOption,
  UpdateUnitDocumentPayload,
} from "../types";

export const unitDocumentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnitDocuments: builder.query<
      UnitDocumentRecord[],
      { associationId?: string } | void
    >({
      query: (params) => ({
        url: "/unit-documents",
        method: "GET",
        params: params
          ? params.associationId
            ? { assoc_id: params.associationId }
            : undefined
          : undefined,
      }),
      transformResponse: (response: any) => response?.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "UnitDocuments" as const,
                id,
              })),
              { type: "UnitDocuments" as const, id: "LIST" },
            ]
          : [{ type: "UnitDocuments" as const, id: "LIST" }],
    }),

    getUnitDocumentUnits: builder.query<UnitOption[], string>({
      query: (associationId) => ({
        url: `/admin/associations/${associationId}/all-units`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || [],
    }),

    createUnitDocument: builder.mutation<
      { ok: boolean },
      CreateUnitDocumentPayload
    >({
      query: (data) => ({
        url: "/unit-documents",
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "UnitDocuments", id: "LIST" }],
    }),

    updateUnitDocument: builder.mutation<
      { ok: boolean },
      { id: string; data: UpdateUnitDocumentPayload }
    >({
      query: ({ id, data }) => ({
        url: `/unit-documents/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "UnitDocuments", id },
        { type: "UnitDocuments", id: "LIST" },
      ],
    }),

    deleteUnitDocument: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/unit-documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "UnitDocuments", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUnitDocumentsQuery,
  useGetUnitDocumentUnitsQuery,
  useCreateUnitDocumentMutation,
  useUpdateUnitDocumentMutation,
  useDeleteUnitDocumentMutation,
} = unitDocumentsApi;
