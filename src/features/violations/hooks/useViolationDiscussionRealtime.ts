import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import {
  connectSocket,
  listenSocketMessage,
} from "@/services/realtime/socketClient";
import { violationsApi } from "../api/violationsApi";
import type { ViolationMessage } from "../types";

/**
 * Keeps an open violation discussion in sync for both the homeowner and Board.
 * The HTTP query remains the source of truth if the realtime socket is unavailable.
 */
export function useViolationDiscussionRealtime(
  violationId: string | undefined,
  enabled = true
): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled || !violationId) {
      return;
    }

    const unsubscribe = listenSocketMessage((event) => {
      if (event.type !== "violation.message") return;
      if (String(event.violation_id) !== String(violationId)) return;

      const message = event.message as ViolationMessage | undefined;
      if (!message?.id) return;

      dispatch(
        violationsApi.util.updateQueryData(
          "getViolationMessages",
          violationId,
          (draft) => {
            if (!draft.some((item) => String(item.id) === String(message.id))) {
              draft.push(message);
            }
          }
        )
      );
    });

    void connectSocket().catch(() => {
      // Sending and refreshing messages still work without a realtime socket.
    });

    return unsubscribe;
  }, [dispatch, enabled, violationId]);
}
