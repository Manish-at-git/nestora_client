import { baseApi } from "@/services/api/baseApi";
import type { DocumentPayload, DocumentRecord } from "../types";

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<DocumentRecord[], { association_id?: string } | void>({
      query: (params) => ({
        url: "/admin/documents",
        method: "GET",
        params: params ? (params.association_id ? { assoc_id: params.association_id } : undefined) : undefined,
      }),
      transformResponse: (response: any) => response?.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Documents" as const, id })),
              { type: "Documents" as const, id: "LIST" },
            ]
          : [{ type: "Documents" as const, id: "LIST" }],
    }),
    createDocument: builder.mutation<{ ok: boolean }, DocumentPayload>({
      query: (data) => ({ url: "/admin/documents", method: "POST", data }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),
    updateDocument: builder.mutation<{ ok: boolean }, { id: string; data: Omit<DocumentPayload, "association_id" | "file_url" | "file_name" | "file_type" | "file_size_kb"> }>({
      query: ({ id, data }) => ({ url: `/admin/documents/${id}`, method: "PUT", data }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Documents", id },
        { type: "Documents", id: "LIST" },
      ],
    }),
    deleteDocument: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/admin/documents/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;
