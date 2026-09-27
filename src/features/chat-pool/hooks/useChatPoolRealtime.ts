import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { useAuth } from "@/context/AuthContext";
import { connectSocket, listenSocketMessage } from "@/services/realtime";
import { chatPoolApi } from "../api/chatPoolApi";
import type { ChatPoolMessage, ChatPoolType } from "../types";

/** Synchronize the currently open pool after the server commits a message. */
export function useChatPoolRealtime(
  poolType: ChatPoolType | undefined,
  poolId: string | undefined,
  associationId: string | undefined,
): void {
  const dispatch = useAppDispatch();
  const { account } = useAuth();

  useEffect(() => {
    if (!poolType || !poolId || !associationId) return;

    const unsubscribe = listenSocketMessage((event) => {
      if (event.type !== "committee_chat.message") return;
      if (event.pool_type !== poolType || event.pool_id !== poolId) return;
      if (event.association_id !== associationId) return;

      const message = event.message as ChatPoolMessage | undefined;
      if (!message?.id) return;
      const normalizedMessage = {
        ...message,
        is_mine: String(message.sender_id) === String(account?.id),
      };
      dispatch(
        chatPoolApi.util.updateQueryData(
          "getChatPoolMessages",
          { poolType, poolId, associationId },
          (draft) => {
            if (!draft.some((item) => item.id === normalizedMessage.id)) {
              draft.push(normalizedMessage);
            }
          },
        ),
      );
    });

    void connectSocket().catch(() => undefined);
    return unsubscribe;
  }, [account?.id, associationId, dispatch, poolId, poolType]);
}
