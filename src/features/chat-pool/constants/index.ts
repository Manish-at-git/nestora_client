import type { ChatPoolType } from "../types";

export const getChatPoolPath = (poolType: ChatPoolType, poolId: string): string =>
  `/chat/${encodeURIComponent(poolType)}/${encodeURIComponent(poolId)}`;
