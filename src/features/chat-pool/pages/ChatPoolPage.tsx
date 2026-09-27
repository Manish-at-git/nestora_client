import React, { useEffect } from "react";
import { LoaderCircle, MessageSquare, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AccessRestricted } from "@/components/common";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/constants/featureCodes";
import { useGetChatPoolsQuery } from "../api/chatPoolApi";
import { ChatPoolWorkspace } from "../components/ChatPoolWorkspace";
import { getChatPoolPath } from "../constants";
import type { ChatPool, ChatPoolType } from "../types";

export const ChatPoolPage: React.FC = () => {
  const permission = usePermission(FEATURES.CHAT_POOL.FEATURE_CODE);
  const { poolType, poolId } = useParams<{ poolType?: ChatPoolType; poolId?: string }>();
  const navigate = useNavigate();
  const { data: pools = [], isLoading } = useGetChatPoolsQuery(undefined, {
    skip: !permission.canView,
  });
  usePageHeader({
    title: FEATURES.CHAT_POOL.FEATURE_LABEL,
    description: "Private conversations with your board and committee groups.",
  });

  const selectedPool = pools.find(
    (pool) => pool.pool_type === poolType && pool.pool_id === poolId,
  ) || pools[0] || null;

  useEffect(() => {
    if (!selectedPool || (selectedPool.pool_type === poolType && selectedPool.pool_id === poolId)) {
      return;
    }
    navigate(getChatPoolPath(selectedPool.pool_type, selectedPool.pool_id), { replace: true });
  }, [navigate, poolId, poolType, selectedPool]);

  const selectPool = (pool: ChatPool) => {
    navigate(getChatPoolPath(pool.pool_type, pool.pool_id));
  };

  if (!permission.isLoading && !permission.canView) {
    return <AccessRestricted moduleName={FEATURES.CHAT_POOL.FEATURE_LABEL} showAction />;
  }

  if (isLoading || permission.isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center text-sm text-slate-500">
        <LoaderCircle className="mr-2 animate-spin" size={17} /> Loading chat pools
      </div>
    );
  }

  if (!pools.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <MessageSquare className="mb-3 text-slate-300" size={32} />
        <h2 className="font-semibold text-slate-800">No chat pools available</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Your permission is active, but you are not assigned to an active board or committee pool.
        </p>
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100dvh-11rem)] min-h-[440px] gap-5 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Your chat pools</h2>
          <p className="mt-0.5 text-xs text-slate-500">Board and committee conversations</p>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
          {pools.map((pool) => {
            const selected =
              pool.pool_id === selectedPool?.pool_id && pool.pool_type === selectedPool.pool_type;
            return (
              <button
                key={`${pool.pool_type}-${pool.pool_id}`}
                type="button"
                onClick={() => selectPool(pool)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                  selected ? "bg-indigo-50" : "hover:bg-slate-50",
                )}
              >
                <span className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500",
                )}>
                  {pool.pool_type === "board" ? <Users size={16} /> : <MessageSquare size={16} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800">{pool.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {pool.pool_type === "board" ? "Board conversation" : "Committee conversation"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>
      {selectedPool && <ChatPoolWorkspace pool={selectedPool} />}
    </div>
  );
};
