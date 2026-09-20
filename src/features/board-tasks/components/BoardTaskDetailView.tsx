import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Paperclip,
  User,
  Building,
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Loader2,
  X,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_CODE } from "@/constants/roleCodes";
import { useAuth } from "@/context/AuthContext";
import {
  uploadMediaAsset,
  uploadDocumentAsset,
  resolveMediaUrl,
} from "@/lib/cloudUploader";
import { BoardTaskStatusBadge } from "./BoardTaskStatusBadge";
import {
  useGetBoardTaskMessagesQuery,
  useSendBoardTaskMessageMutation,
  useUpdateBoardTaskStatusMutation,
} from "../api/boardTasksApi";
import { useBoardTaskRealtime } from "../hooks/useBoardTaskRealtime";
import type { BoardTask, BoardTaskStatus } from "../types";

export interface BoardTaskDetailViewProps {
  task: BoardTask;
  onBack: () => void;
  onStatusChange?: (status: BoardTaskStatus) => void;
}

// Utility to check if a URL is a known document
const isDocumentUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar)($|\?)/i.test(url);
};

// Utility to check if a URL is an image
const isImageUrl = (url?: string | null): boolean => {
  if (!url) return false;
  if (isDocumentUrl(url)) return false;
  return (
    /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)($|\?)/i.test(url) ||
    url.includes("ufs.sh/f/") ||
    url.includes("uploadthing") ||
    url.includes("cloudinary") ||
    url.startsWith("data:image/") ||
    url.startsWith("blob:") ||
    url.includes("/uploads/media/")
  );
};

// Reusable Attachment Preview Component
interface AttachmentPreviewProps {
  url: string;
  title?: string;
  isMessage?: boolean;
  isMine?: boolean;
  onImageClick?: (url: string) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  url,
  title = "Attachment",
  isMessage = false,
  isMine = false,
  onImageClick,
}) => {
  const [loadError, setLoadError] = useState(false);
  const resolvedUrl = resolveMediaUrl(url);
  const isImage = !loadError && isImageUrl(url);

  if (isImage) {
    return (
      <div className="mt-2 group relative overflow-hidden rounded-xl border border-slate-200/40 bg-slate-900/10">
        <img
          src={resolvedUrl}
          alt={title}
          onError={() => setLoadError(true)}
          onClick={() => onImageClick && onImageClick(resolvedUrl)}
          className={`w-full object-cover rounded-xl transition-all duration-200 cursor-pointer hover:opacity-95 ${
            isMessage ? "max-h-56 min-h-28" : "max-h-72"
          }`}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
          <button
            type="button"
            onClick={() => onImageClick && onImageClick(resolvedUrl)}
            className="text-[11px] font-medium text-white hover:underline flex items-center gap-1"
          >
            <ImageIcon size={13} />
            Preview Image
          </button>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-medium text-white/90 hover:text-white flex items-center gap-1"
          >
            <ExternalLink size={12} />
            Open
          </a>
        </div>
      </div>
    );
  }

  // Document fallback preview
  return (
    <div
      className={`mt-2 flex items-center justify-between p-3 rounded-xl border transition-all ${
        isMine
          ? "bg-white/10 border-white/20 text-white"
          : "bg-slate-50 border-slate-200 text-slate-800"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <FileText
          size={18}
          className={isMine ? "text-indigo-300" : "text-indigo-600 shrink-0"}
        />
        <span className="text-xs font-medium truncate max-w-[180px]">
          {url.split("/").pop() || title}
        </span>
      </div>
      <a
        href={resolvedUrl}
        target="_blank"
        rel="noreferrer"
        className={`text-xs font-semibold hover:underline flex items-center gap-1 shrink-0 ${
          isMine ? "text-indigo-200 hover:text-white" : "text-indigo-600"
        }`}
      >
        <Download size={13} />
        View File
      </a>
    </div>
  );
};

export const BoardTaskDetailView: React.FC<BoardTaskDetailViewProps> = ({
  task,
  onBack,
  onStatusChange,
}) => {
  const { account } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<BoardTaskStatus>(task.status);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // RTK Query hooks
  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useGetBoardTaskMessagesQuery(task.id, {
    pollingInterval: 5000,
  });

  const [sendMessage, { isLoading: isSending }] =
    useSendBoardTaskMessageMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateBoardTaskStatusMutation();

  useBoardTaskRealtime(task.id);

  const userRoleCode = account?.role_code;
  const isAdmin = userRoleCode === ROLE_CODE.SUPER_ADMIN || userRoleCode === ROLE_CODE.ADMIN;
  const isBoardMember = userRoleCode === ROLE_CODE.BOARD_MEMBER;
  const canManageTask = isAdmin || isBoardMember;

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStatusUpdate = async (newStatus: BoardTaskStatus) => {
    try {
      await updateStatus({ taskId: task.id, status: newStatus }).unwrap();
      setCurrentStatus(newStatus);
      toast.success(`Task status updated to "${newStatus}"`);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || "Failed to update task status");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachedFile) return;

    let attachmentUrl: string | null = null;
    if (attachedFile) {
      try {
        setUploadingAttachment(true);
        const uploader = attachedFile.type.startsWith("image/")
          ? uploadMediaAsset
          : uploadDocumentAsset;
        const uploadData = await uploader(attachedFile);
        if (uploadData && uploadData.ok && uploadData.url) {
          attachmentUrl = uploadData.url;
        }
      } catch (err: any) {
        toast.error("Failed to upload file attachment");
        setUploadingAttachment(false);
        return;
      } finally {
        setUploadingAttachment(false);
      }
    }

    try {
      await sendMessage({
        taskId: task.id,
        data: {
          message: newMessage.trim(),
          attachment_url: attachmentUrl,
        },
      }).unwrap();

      setNewMessage("");
      setAttachedFile(null);
      refetchMessages();
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || "Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full hover:bg-slate-100 text-slate-600 shrink-0"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg md:text-xl font-display font-bold text-slate-800 truncate">
                {task.title}
              </h2>
              <BoardTaskStatusBadge status={currentStatus} size="md" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-medium text-indigo-600">Board Task</span>
              {task.association_name && (
                <>
                  <span>•</span>
                  <span>{task.association_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Actions & Badges */}
        <div className="flex items-center gap-2.5 ml-auto">
          {canManageTask && (
            <div className="flex items-center gap-2">
              {/* Approve (New -> In Progress) */}
              {currentStatus === "New" && isAdmin && (
                <Button
                  onClick={() => handleStatusUpdate("In Progress")}
                  disabled={isUpdatingStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Approve Task
                </Button>
              )}

              {/* Complete & Cancel (Available when New or In Progress) */}
              {(currentStatus === "New" || currentStatus === "In Progress") && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate("Cancelled")}
                    disabled={isUpdatingStatus}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("Completed")}
                    disabled={isUpdatingStatus}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    Mark Complete
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 pt-5 overflow-hidden min-h-0">
        {/* Left Pane: Task Details */}
        <div className="lg:col-span-5 overflow-y-auto pr-1 space-y-5 min-h-0">
          {/* Key Metadata Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Supervised By
              </span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {task.supervised_by_name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {task.supervised_by_name || "Unassigned"}
                </span>
              </div>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Created By
              </span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {task.created_by_name?.charAt(0) || "A"}
                </div>
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {task.created_by_name || "Admin"}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Calendar size={13} className="text-slate-400 shrink-0" />
                <span>Created:</span>
              </div>
              <span className="font-semibold text-slate-700">
                {task.created_at ? new Date(task.created_at).toLocaleString() : "N/A"}
              </span>
            </div>
            {task.updated_at && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span>Updated:</span>
                </div>
                <span className="font-semibold text-slate-700">
                  {new Date(task.updated_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Task Description
            </h4>
            <div className="bg-slate-50/60 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap border border-slate-100">
              {task.description}
            </div>
          </div>

          {/* Task Attachment */}
          {task.image_url && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Attached Media / File
              </h4>
              <AttachmentPreview
                url={task.image_url}
                title={task.title}
                onImageClick={(url) => setLightboxImageUrl(url)}
              />
            </div>
          )}
        </div>

        {/* Right Pane: Discussion & Communication */}
        <div className="lg:col-span-7 flex flex-col bg-slate-50/50 rounded-2xl border border-slate-200/80 overflow-hidden min-h-[400px] lg:min-h-0 h-full">
          <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
            <h4 className="text-sm font-display font-bold text-slate-800">
              Activity & Communication Thread
            </h4>
            <span className="text-xs text-slate-400">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {isMessagesLoading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <p className="text-xs">Loading message thread...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 p-6 border-2 border-dashed border-slate-200/70 rounded-2xl">
                <p className="text-sm font-medium text-slate-600 mb-1">
                  No comments or updates yet
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Send a message below to coordinate with supervisors and board members.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMine =
                  m.sender_id === account?.account_id ||
                  m.sender_id === account?.id;

                const senderDisplayName = isMine
                  ? "You"
                  : m.sender_name && m.sender_name.trim() !== ""
                  ? m.sender_name
                  : m.email
                  ? m.email.split("@")[0]
                  : m.role_name || "Member";

                const senderRole = !isMine ? m.role_name : null;

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      isMine ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Header above message bubble with true sender name & optional role tag */}
                    <div
                      className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="font-semibold text-slate-700">
                        {senderDisplayName}
                      </span>
                      {senderRole && (
                        <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded-md font-medium">
                          {senderRole}
                        </span>
                      )}
                      {m.created_at && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Chat bubble */}
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-1 text-sm shadow-xs ${
                        isMine
                          ? "bg-slate-900 text-white rounded-tr-xs"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
                      }`}
                    >
                      {m.message && (
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {m.message}
                        </p>
                      )}

                      {/* Image or file attachment in message */}
                      {m.attachment_url && (
                        <AttachmentPreview
                          url={m.attachment_url}
                          title="Message attachment"
                          isMessage
                          isMine={isMine}
                          onImageClick={(url) => setLightboxImageUrl(url)}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached File Preview Bar */}
          {attachedFile && (
            <div className="px-5 py-2 bg-indigo-50/70 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-900 shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Paperclip size={14} className="text-indigo-600 shrink-0" />
                <span className="truncate font-medium">{attachedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="text-indigo-500 hover:text-indigo-800 p-1 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <label className="cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors shrink-0">
              <Paperclip size={18} />
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAttachedFile(e.target.files[0]);
                  }
                }}
              />
            </label>

            <Input
              className="flex-1 rounded-full border-slate-200 bg-slate-50 px-4 py-2 text-sm focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 focus-visible:bg-white transition-all"
              placeholder={
                attachedFile
                  ? `File attached: ${attachedFile.name}`
                  : "Type a message or status update..."
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending || uploadingAttachment}
            />

            <Button
              type="submit"
              size="icon"
              disabled={
                isSending ||
                uploadingAttachment ||
                (!newMessage.trim() && !attachedFile)
              }
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0 w-10 h-10 shadow-xs transition-all"
            >
              {isSending || uploadingAttachment ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Fullscreen Image Lightbox */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Image Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImageUrl(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-hidden">
              <img
                src={lightboxImageUrl}
                alt="Enlarged preview"
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardTaskDetailView;
