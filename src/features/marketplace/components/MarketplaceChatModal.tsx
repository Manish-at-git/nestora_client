import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Send,
  User,
  ChevronLeft,
  MessageCircle,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useRetainedModalData } from "@/hooks/useRetainedModalData";
import { connectSocket, listenSocketMessage } from "@/services/realtime";
import {
  useGetMarketplaceChatQuery,
  useGetMarketplaceChatThreadsQuery,
  useSendMarketplaceChatMutation,
} from "../api/marketplaceApi";
import type { MarketplaceItem, MarketplaceChatThread } from "../types";

export interface MarketplaceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MarketplaceItem | null;
}

export const MarketplaceChatModal: React.FC<MarketplaceChatModalProps> = ({
  isOpen,
  onClose,
  item: activeItem,
}) => {
  const item = useRetainedModalData(activeItem);
  const { account } = useAuth();
  const [selectedBuyer, setSelectedBuyer] = useState<MarketplaceChatThread | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isOwner = Boolean(
    item && account && (item.owner_account_id || item.user_id) === account.account_id
  );

  // If owner, fetch threads
  const {
    data: threads = [],
    isLoading: isLoadingThreads,
    refetch: refetchThreads,
  } = useGetMarketplaceChatThreadsQuery(item?.id || "", {
    skip: !isOpen || !item || !isOwner,
  });

  // Fetch messages
  const buyerIdForQuery = isOwner ? selectedBuyer?.buyer_id : undefined;
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useGetMarketplaceChatQuery(
    { itemId: item?.id || "", buyerId: buyerIdForQuery },
    {
      skip: !isOpen || !item || (isOwner && !selectedBuyer),
    }
  );

  const [sendMessage, { isLoading: isSending }] =
    useSendMarketplaceChatMutation();

  useEffect(() => {
    if (!isOpen || !item) return;
    void connectSocket().catch(() => undefined);
    return listenSocketMessage((event) => {
      if (event.type !== "marketplace.chat.message" || event.item_id !== item.id) return;
      void refetchMessages();
      void refetchThreads();
    });
  }, [isOpen, item, refetchMessages, refetchThreads]);

  useEffect(() => {
    if (isOpen) {
      setMessageText("");
      setSelectedBuyer(null);
    }
  }, [isOpen, item]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !item) return;

    try {
      await sendMessage({
        itemId: item.id,
        message: messageText.trim(),
        receiver_id: isOwner ? selectedBuyer?.buyer_id : undefined,
      }).unwrap();

      setMessageText("");
      refetchMessages();
      if (isOwner) refetchThreads();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to send message");
    }
  };

  if (!item) return null;

  const showThreadsList = isOwner && !selectedBuyer;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {isOwner && selectedBuyer && (
            <button
              type="button"
              onClick={() => setSelectedBuyer(null)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              title="Back to messages"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">
              {showThreadsList
                ? "Buyer Inquiries"
                : isOwner
                ? selectedBuyer?.buyer_name || "Buyer"
                : item.seller_name || "Seller"}
            </h3>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <ShoppingBag size={10} />
              {item.title} • ₹{Number(item.price || 0).toLocaleString()}
            </p>
          </div>
        </div>
      }
      size="md"
      bodyClassName="p-0 overflow-hidden flex flex-col h-[520px]"
    >
      {/* View Mode: Seller Threads List */}
      {showThreadsList ? (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
          {isLoadingThreads ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Loading inquiries...
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 space-y-2">
              <MessageCircle size={32} className="text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">
                No inquiries yet
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                When buyers send messages about your listing, their inquiries will appear here.
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.buyer_id}
                type="button"
                onClick={() => setSelectedBuyer(thread)}
                className="w-full text-left p-3.5 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-3 cursor-pointer bg-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar size="sm" fallbackText={thread.buyer_name} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {thread.buyer_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {thread.last_message || "Started a conversation"}
                    </p>
                  </div>
                </div>
                {thread.last_message_at && (
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(thread.last_message_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      ) : (
        /* View Mode: Active Chat Conversation */
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/40">
          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4 space-y-1.5">
                <MessageCircle size={28} className="text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">
                  Start the Conversation
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Ask about product condition, negotiate price, or arrange inspection and pickup.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = Boolean(msg.is_mine);
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${
                      isMine ? "items-end" : "items-start"
                    }`}
                  >
                    {!isMine && (
                      <span className="text-[10px] font-medium text-slate-400 mb-0.5 ml-1">
                        {msg.sender_name || "User"}
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                        isMine
                          ? "bg-indigo-600 text-white rounded-tr-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      {msg.created_at && (
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            isMine ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2"
          >
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 h-10 text-xs rounded-xl"
              autoFocus
            />
            <Button
              type="submit"
              disabled={isSending || !messageText.trim()}
              className="h-10 px-3.5 rounded-xl cursor-pointer"
            >
              <Send size={14} />
            </Button>
          </form>
        </div>
      )}
    </ModalWrapper>
  );
};

export default MarketplaceChatModal;
