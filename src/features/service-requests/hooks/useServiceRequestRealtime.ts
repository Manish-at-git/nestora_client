import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import {
  connectSocket,
  listenSocketMessage,
} from "@/services/realtime/socketClient";
import { serviceRequestsApi } from "../api/serviceRequestsApi";
import type { ServiceRequestMessage } from "../types";

/**
 * Keeps the open service-request conversation in sync with the authenticated
 * domain socket. HTTP remains the source of truth when realtime is unavailable.
 */
export function useServiceRequestRealtime(
  requestId: string | number | undefined,
  enabled = true
): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      !enabled ||
      requestId === undefined ||
      requestId === null ||
      String(requestId).trim() === ""
    ) {
      return;
    }

    const unsubscribe = listenSocketMessage((event) => {
      if (event.type !== "service_request.message") return;
      if (String(event.request_id) !== String(requestId)) return;

      const message = event.message as ServiceRequestMessage | undefined;
      if (!message?.id) return;

      dispatch(
        serviceRequestsApi.util.updateQueryData(
          "getServiceRequestMessages",
          requestId,
          (draft) => {
            if (!draft.some((item) => String(item.id) === String(message.id))) {
              draft.push(message);
            }
          }
        )
      );
    });

    void connectSocket().catch(() => {
      // The message POST and subsequent query remain available without a socket.
    });

    return unsubscribe;
  }, [dispatch, enabled, requestId]);
}
