import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  MessageSquare,
  Paperclip,
  Send,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveMediaUrl, uploadDocumentAsset, uploadMediaAsset } from "@/lib/cloudUploader";
import { useGetChatPoolMessagesQuery, useSendChatPoolMessageMutation } from "../api/chatPoolApi";
import { useChatPoolRealtime } from "../hooks/useChatPoolRealtime";
import type { ChatPool } from "../types";

interface ChatPoolWorkspaceProps {
  pool: ChatPool;
}

const EMPTY_MESSAGES: never[] = [];

const isImageAttachment = (url?: string | null): boolean =>
  Boolean(url && /\.(avif|gif|jpe?g|png|webp)(?:\?.*)?$/i.test(url));

const formatTimestamp = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const ChatPoolWorkspace: React.FC<ChatPoolWorkspaceProps> = ({ pool }) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryArgs = {
    poolType: pool.pool_type,
    poolId: pool.pool_id,
    associationId: pool.association_id,
  } as const;
  const { data, isLoading } = useGetChatPoolMessagesQuery(queryArgs);
  const messages = data ?? EMPTY_MESSAGES;
  const [sendMessage, { isLoading: isSending }] = useSendChatPoolMessageMutation();

  useChatPoolRealtime(pool.pool_type, pool.pool_id, pool.association_id);

  const latestMessageId = messages.at(-1)?.id;

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [latestMessageId, pool.pool_id, pool.pool_type]);

  const clearAttachment = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim() && !selectedFile) return;

    let attachmentUrl: string | undefined;
    if (selectedFile) {
      try {
        setIsUploading(true);
        const upload = selectedFile.type.startsWith("image/")
          ? uploadMediaAsset
          : uploadDocumentAsset;
        const uploaded = await upload(selectedFile);
        attachmentUrl = uploaded.url;
      } catch (error: any) {
        toast.error(error?.message || "Unable to upload the attachment");
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      await sendMessage({
        ...queryArgs,
        message: message.trim() || "Attachment",
        attachmentUrl,
      }).unwrap();
      setMessage("");
      clearAttachment();
    } catch (error: any) {
      toast.error(error?.data || "Unable to send your message");
    }
  };

  const subtitle = pool.pool_type === "board"
    ? "All board members in this association"
    : "Committee members and all board members";

  return (
    <section className="flex h-[calc(100dvh-11rem)] min-h-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {pool.pool_type === "board" ? <Users size={19} /> : <MessageSquare size={19} />}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-800">{pool.name}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>

      <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-5">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            <LoaderCircle className="mr-2 animate-spin" size={17} /> Loading messages
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
            <MessageSquare className="mb-3 text-slate-300" size={30} />
            <p className="font-medium text-slate-700">No messages yet</p>
            <p className="mt-1 text-sm">Start the conversation with your group.</p>
          </div>
        ) : (
          messages.map((item) => {
            const mine = Boolean(item.is_mine);
            const attachmentUrl = resolveMediaUrl(item.attachment_url);
            return (
              <article key={item.id} className={cn("flex gap-2.5", mine && "flex-row-reverse")}>
                {!mine && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                    {item.profile_pic_url ? (
                      <img src={resolveMediaUrl(item.profile_pic_url)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      item.sender_name?.slice(0, 1).toUpperCase() || "?"
                    )}
                  </div>
                )}
                <div className={cn("max-w-[82%] sm:max-w-[70%]", mine && "items-end text-right")}>
                  {!mine && <p className="mb-1 px-1 text-xs font-medium text-slate-500">{item.sender_name || "Member"}</p>}
                  <div className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm shadow-xs",
                    mine ? "rounded-tr-sm bg-indigo-600 text-white" : "rounded-tl-sm border border-slate-200 bg-white text-slate-700",
                  )}>
                    {attachmentUrl && (
                      <div className={cn("mb-2", !item.message && "mb-0")}>
                        {isImageAttachment(item.attachment_url) ? (
                          <a href={attachmentUrl} target="_blank" rel="noreferrer">
                            <img src={attachmentUrl} alt="Shared attachment" className="max-h-56 rounded-lg object-cover" />
                          </a>
                        ) : (
                          <a href={attachmentUrl} target="_blank" rel="noreferrer" className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium",
                            mine ? "bg-white/15 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200",
                          )}>
                            <FileText size={15} /> Open attachment
                          </a>
                        )}
                      </div>
                    )}
                    {item.message && item.message !== "Attachment" ? <p className="whitespace-pre-wrap break-words">{item.message}</p> : null}
                  </div>
                  <p className="mt-1 px-1 text-[10px] text-slate-400">{formatTimestamp(item.created_at)}</p>
                </div>
              </article>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-200 bg-white p-3 sm:p-4">
        {selectedFile && (
          <div className="mb-3 flex max-w-max items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            {selectedFile.type.startsWith("image/") ? <ImageIcon size={14} /> : <FileText size={14} />}
            <span className="max-w-52 truncate">{selectedFile.name}</span>
            <button type="button" onClick={clearAttachment} className="text-indigo-500 hover:text-indigo-700" aria-label="Remove attachment">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <Button type="button" variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => fileInputRef.current?.click()} aria-label="Attach a file">
            <Paperclip size={17} />
          </Button>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write a message…"
            rows={1}
            className="min-h-10 max-h-32 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-xl" disabled={isUploading || isSending || (!message.trim() && !selectedFile)} aria-label="Send message">
            {isUploading || isSending ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />}
          </Button>
        </div>
      </form>
    </section>
  );
};
