import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { connectSocket, listenSocketMessage } from "@/services/realtime/socketClient";
import { committeesApi } from "../api/committeesApi";
import type { CommitteeChatMessage } from "../types";

/** Keep an open Board/Committee chat query in sync with DB-first socket events. */
export function useCommitteeChatRealtime(
  poolType: string | undefined,
  poolId: string | undefined,
  associationId: string | undefined,
): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!poolType || !poolId || !associationId) return;
    const unsubscribe = listenSocketMessage((event) => {
      if (event.type !== "committee_chat.message") return;
      if (String(event.pool_type) !== poolType || String(event.pool_id) !== poolId) return;
      if (String(event.association_id) !== associationId) return;
      const message = event.message as CommitteeChatMessage | undefined;
      if (!message?.id) return;
      dispatch(
        committeesApi.util.updateQueryData(
          "getCommitteeChat",
          { pool_type: poolType, pool_id: poolId, assoc_id: associationId },
          (draft) => {
            if (!draft.some((item) => String(item.id) === String(message.id))) draft.push(message);
          },
        ),
      );
    });
    void connectSocket().catch(() => undefined);
    return unsubscribe;
  }, [associationId, dispatch, poolId, poolType]);
}
