import React, { useState, useRef, useEffect } from "react";
import {
  Wrench,
  Clock,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  Send,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Edit3,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  STATUS_BADGE_CONFIG,
  STATUS_API_VALUES,
  normalizeServiceStatus,
  type ServiceStatusKey,
} from "../constants";
import {
  useGetServiceRequestMessagesQuery,
  useSendServiceRequestMessageMutation,
  useUpdateServiceRequestStatusMutation,
} from "../api/serviceRequestsApi";
import { useServiceRequestRealtime } from "../hooks/useServiceRequestRealtime";
import { uploadMediaAsset, uploadDocumentAsset, resolveMediaUrl } from "@/lib/cloudUploader";
import type { ServiceRequest } from "../types";

export interface ServiceRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onOpenMapModal?: () => void;
  canManageStatus?: boolean;
}

export const ServiceRequestDetailModal: React.FC<ServiceRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onOpenMapModal,
  canManageStatus = false,
}) => {
  const { account } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateServiceRequestStatusMutation();

  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useGetServiceRequestMessagesQuery(request?.id || "", {
    skip: !isOpen || !request?.id,
  });

  const [sendMessage, { isLoading: isSending }] =
    useSendServiceRequestMessageMutation();

  useServiceRequestRealtime(request?.id, isOpen && Boolean(request?.id));

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const [localStatus, setLocalStatus] = useState<string>(request?.status ?? "");

  useEffect(() => {
    if (request) setLocalStatus(request.status);
  }, [request]);

  if (!request) return null;

  const statusKey = normalizeServiceStatus(localStatus);
  const statusConfig = STATUS_BADGE_CONFIG[statusKey];

  const isNew = statusKey === "new";
  const isInProgress = statusKey === "in_progress";
  const isUnassigned = !request.association_id || !request.unit_id;

  const handleStatusChange = async (newStatusKey: ServiceStatusKey) => {
    const apiStatus = STATUS_API_VALUES[newStatusKey];
    try {
      const res = await updateStatus({
        id: request.id,
        status: apiStatus,
      }).unwrap();
      if (res.ok) {
        toast.success(`Request marked as ${STATUS_BADGE_CONFIG[newStatusKey].label}`);
        setLocalStatus(apiStatus);
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.detail || err?.data?.message || "Failed to update status";
      toast.error(errorMsg);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    let attachmentUrl: string | undefined = undefined;
    if (selectedFile) {
      try {
        setIsUploading(true);
        const isImg = selectedFile.type.startsWith("image/");
        const uploadFn = isImg ? uploadMediaAsset : uploadDocumentAsset;
        const res = await uploadFn(selectedFile);
        if (res && res.ok && res.url) {
          attachmentUrl = res.url;
        } else {
          toast.error("Failed to upload file attachment");
          setIsUploading(false);
          return;
        }
      } catch {
        toast.error("Error uploading file attachment");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      const res = await sendMessage({
        requestId: request.id,
        message: newMessage.trim() || undefined,
        attachment_url: attachmentUrl,
      }).unwrap();

      if (res.ok) {
        setNewMessage("");
        setSelectedFile(null);
        refetchMessages();
      }
    } catch {
      toast.error("Failed to send message");
    }
  };

  const currentUserId = String(account?.account_id || account?.id || "");

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Wrench size={18} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {request.sr_display_id || `SR-#${request.id}`}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {request.service_type} • Created on{" "}
              {new Date(request.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[460px] max-h-[70vh]">
        {/* Left Column: Request Details & Property Info (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 pr-0 md:pr-5 dark:border-slate-800 overflow-y-auto space-y-4">
          <div className="space-y-4">
            {/* Status Quick Actions for Admins */}
            {canManageStatus && (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2.5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Update Ticket Status
                  </span>
                  {isUnassigned && onOpenMapModal && (
                    <Button
                      variant="ghost"
                      className="h-7 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 px-2"
                      onClick={onOpenMapModal}
                    >
                      <Pencil size={13} className="mr-1" />
                      Map Unit
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {isNew && (
                    <Button
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1"
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange("in_progress")}
                    >
                      <PlayCircle size={14} className="mr-1" />
                      Approve Request
                    </Button>
                  )}

                  {isInProgress && (
                    <Button
                      className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex-1"
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange("completed")}
                    >
                      <CheckCircle2 size={14} className="mr-1" />
                      Mark Complete
                    </Button>
                  )}

                  {statusKey !== "cancelled" && statusKey !== "completed" && (
                    <Button
                      variant="outline"
                      className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50"
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange("cancelled")}
                    >
                      <XCircle size={14} className="mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Resident & Unit Details */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-2 dark:border-slate-800 dark:bg-slate-900/30">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resident Details
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {request.requestor_name || "Unknown Resident"}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                {request.unit_number ? (
                  <>
                    <Home size={13} className="text-slate-400" />
                    <span>
                      Unit {request.unit_number} • {request.block_name || "Block"}
                    </span>
                    {request.association_name && (
                      <span className="text-slate-400">
                        ({request.association_name})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Not assigned to property
                  </span>
                )}
              </div>

              {(request.requestor_phone || request.requestor_email) && (
                <div className="space-y-1 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  {request.requestor_phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} />
                      <span>{request.requestor_phone}</span>
                    </div>
                  )}
                  {request.requestor_email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail size={12} />
                      <span>{request.requestor_email}</span>
                    </div>
                  )}
                </div>
              )}

              {request.incoming_call_no && (
                <div className="mt-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                  📞 Reported via call: {request.incoming_call_no}
                </div>
              )}
            </div>

            {/* Request Specifics */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ticket Information
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Category:
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {request.service_type}
                  {request.sub_category ? ` - ${request.sub_category}` : ""}
                </p>
              </div>

              {request.custom_title && (
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Custom Title:
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {request.custom_title}
                  </p>
                </div>
              )}

              {request.description && (
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Description:
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 mt-1">
                    {request.description}
                  </p>
                </div>
              )}

              {request.image_url && (
                <div className="pt-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Attached Photo:
                  </span>
                  <a
                    href={resolveMediaUrl(request.image_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 max-w-[200px]"
                  >
                    <img
                      src={resolveMediaUrl(request.image_url)}
                      alt="Service issue"
                      className="h-28 w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium gap-1">
                      <ExternalLink size={13} /> View Full
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Threaded Discussion & Chat (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between h-full">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Conversation & Updates</span>
            </div>
            <span className="text-xs text-slate-400">
              {messages.length} message{messages.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[320px]">
            {isMessagesLoading ? (
              <div className="flex h-40 items-center justify-center text-xs text-slate-400">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                <MessageSquare size={24} className="mb-2 text-slate-300 dark:text-slate-600" />
                <p>No messages yet.</p>
                <p className="text-[11px] text-slate-400">
                  Send an update or question to the resident.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = String(msg.sender_id) === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {isMe ? "You" : msg.sender_name || msg.email || "User"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-xs"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-xs"
                      }`}
                    >
                      {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}

                      {msg.attachment_url && (
                        <div className="mt-2">
                          {msg.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <a
                              href={resolveMediaUrl(msg.attachment_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="block overflow-hidden rounded-lg border border-white/20"
                            >
                              <img
                                src={resolveMediaUrl(msg.attachment_url)}
                                alt="Attachment"
                                className="max-h-36 object-cover rounded-lg"
                              />
                            </a>
                          ) : (
                            <a
                              href={resolveMediaUrl(msg.attachment_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 underline text-[11px] text-indigo-100 hover:text-white"
                            >
                              <Paperclip size={12} /> View File Attachment
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSendMessage}
            className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800"
          >
            {selectedFile && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 text-xs">
                <span className="truncate max-w-[200px] text-slate-600 dark:text-slate-300">
                  📎 {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-400 hover:text-slate-600"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || isUploading}
                title="Attach file or photo"
              >
                <Paperclip size={16} />
              </Button>

              <Input
                placeholder="Type a message or update..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending || isUploading}
                className="flex-1 text-xs h-9"
              />

              <Button
                type="submit"
                className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white px-3"
                disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
              >
                <Send size={14} className="mr-1" />
                {isSending || isUploading ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ModalWrapper>
  );
};
