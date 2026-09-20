import { baseApi } from "@/services/api/baseApi";
import type {
  BoardTask,
  BoardTaskFormData,
  BoardTaskStatus,
  BoardTaskMessage,
  BoardTaskMessageFormData,
  BoardMemberOption,
} from "../types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const boardTasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoardTasks: builder.query<BoardTask[], string | undefined>({
      query: (associationId) => ({
        url: "/board-tasks",
        params:
          associationId && associationId !== "ALL"
            ? { association_id: associationId }
            : undefined,
      }),
      transformResponse: (response: ApiResponse<BoardTask[]>) => response.data || [],
      providesTags: ["BoardTasks"],
    }),

    createBoardTask: builder.mutation<
      { ok: boolean },
      BoardTaskFormData
    >({
      query: (formData) => ({
        url: "/board-tasks",
        method: "POST",
        data: formData,
      }),
      transformResponse: (response: ApiResponse<{ id: string }>) => ({
        ok: response.success,
      }),
      invalidatesTags: ["BoardTasks"],
    }),

    updateBoardTaskStatus: builder.mutation<
      { ok: boolean; message?: string },
      { taskId: string; status: BoardTaskStatus }
    >({
      query: ({ taskId, status }) => ({
        url: `/board-tasks/${taskId}/status`,
        method: "PATCH",
        data: { status },
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
        message: response.message,
      }),
      invalidatesTags: ["BoardTasks"],
    }),

    deleteBoardTask: builder.mutation<{ ok: boolean }, string>({
      query: (taskId) => ({
        url: `/board-tasks/${taskId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ updated: boolean }>) => ({
        ok: response.success,
      }),
      invalidatesTags: ["BoardTasks"],
    }),

    getBoardTaskMessages: builder.query<BoardTaskMessage[], string>({
      query: (taskId) => ({
        url: `/board-tasks/${taskId}/messages`,
      }),
      transformResponse: (response: ApiResponse<BoardTaskMessage[]>) => response.data || [],
      providesTags: (_result, _error, taskId) => [
        { type: "BoardTasks", id: `MESSAGES_${taskId}` },
      ],
    }),

    sendBoardTaskMessage: builder.mutation<
      { ok: boolean },
      { taskId: string; data: BoardTaskMessageFormData }
    >({
      query: ({ taskId, data }) => ({
        url: `/board-tasks/${taskId}/messages`,
        method: "POST",
        data,
      }),
      transformResponse: (response: ApiResponse<{ id: string }>) => ({
        ok: response.success,
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "BoardTasks", id: `MESSAGES_${taskId}` },
      ],
    }),

    getAssociationBoardMembers: builder.query<BoardMemberOption[], string>({
      query: (associationId) => ({
        url: `/associations/${associationId}/board-members`,
      }),
      transformResponse: (response: ApiResponse<BoardMemberOption[]>) => response.data || [],
    }),

    getBoardTaskById: builder.query<BoardTask, string>({
      query: (taskId) => ({
        url: `/board-tasks/${taskId}`,
      }),
      transformResponse: (response: ApiResponse<BoardTask>) => response.data,
      providesTags: (_result, _error, taskId) => [
        { type: "BoardTasks", id: taskId },
      ],
    }),

    getAdminAssociations: builder.query<Array<{ id: string; name: string }>, void>({
      query: () => ({
        url: "/admin/associations",
      }),
      transformResponse: (response: ApiResponse<Array<{ id: string; name: string }>>) =>
        response.data || [],
      providesTags: ["Associations"],
    }),
  }),
});

export const {
  useGetBoardTasksQuery,
  useGetBoardTaskByIdQuery,
  useCreateBoardTaskMutation,
  useUpdateBoardTaskStatusMutation,
  useDeleteBoardTaskMutation,
  useGetBoardTaskMessagesQuery,
  useSendBoardTaskMessageMutation,
  useGetAssociationBoardMembersQuery,
  useLazyGetAssociationBoardMembersQuery,
  useGetAdminAssociationsQuery,
} = boardTasksApi;
