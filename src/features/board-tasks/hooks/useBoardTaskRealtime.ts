import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { connectSocket, listenSocketMessage } from "@/services/realtime/socketClient";
import { boardTasksApi } from "../api/boardTasksApi";
import type { BoardTaskMessage } from "../types";

/** Subscribe an open board-task conversation to the authenticated domain socket. */
export function useBoardTaskRealtime(taskId: string | number | undefined): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (taskId === undefined || taskId === null || String(taskId).trim() === "") {
      return;
    }

    const unsubscribe = listenSocketMessage((event) => {
      if (event.type !== "board_task.message") return;
      if (String(event.task_id) !== String(taskId)) return;
      const message = event.message as BoardTaskMessage | undefined;
      if (!message?.id) return;
      dispatch(
        boardTasksApi.util.updateQueryData("getBoardTaskMessages", String(taskId), (draft) => {
          if (!draft.some((item) => String(item.id) === String(message.id))) {
            draft.push(message);
          }
        })
      );
    });

    void connectSocket().catch(() => {
      // The committed HTTP message remains available when realtime is offline.
    });
    return unsubscribe;
  }, [dispatch, taskId]);
}
