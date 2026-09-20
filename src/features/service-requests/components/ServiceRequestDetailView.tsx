import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Wrench,
  Clock,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  Send,
  Paperclip,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Edit3,
  AlertCircle,
  Building2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export interface ServiceRequestDetailViewProps {
  request: ServiceRequest;
  onBack: () => void;
  onStatusChange?: () => void;
  onOpenMapModal?: () => void;
  canManageStatus?: boolean;
  userIsAdmin?: boolean;
}

export const ServiceRequestDetailView: React.FC<ServiceRequestDetailViewProps> = ({
  request,
  onBack,
  onStatusChange,
  onOpenMapModal,
  canManageStatus = false,
  userIsAdmin = false,
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
  } = useGetServiceRequestMessagesQuery(request.id);

  const [sendMessage, { isLoading: isSending }] =
    useSendServiceRequestMessageMutation();

  useServiceRequestRealtime(request.id);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const [localStatus, setLocalStatus] = useState<string>(request.status);

  useEffect(() => {
    setLocalStatus(request.status);
  }, [request.status]);

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
        onStatusChange?.();
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

  const formattedDate = request.created_at
    ? new Date(request.created_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white px-3 font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <ArrowLeft size={16} />
            Back to Service Requests
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {request.sr_display_id || `SR-#${request.id}`}
            </span>

            {request.unit_number ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Home size={12} className="text-slate-400" />
                <span>
                  Unit {request.unit_number}
                  {request.block_name ? ` • ${request.block_name}` : ""}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertCircle size={12} />
                <span>Unassigned Unit</span>
              </span>
            )}

             <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass}`}
            >
              {statusConfig.label}
            </span>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isUnassigned && userIsAdmin && onOpenMapModal && (
            <Button
              variant="outline"
              onClick={onOpenMapModal}
              className="h-9 gap-1.5 rounded-xl border-indigo-200 bg-indigo-50/50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/70 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <Pencil size={13} />
              Map to Unit
            </Button>
          )}

          {canManageStatus && (
            <>
              {isNew && (
                <Button
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={isUpdatingStatus}
                  className="h-9 gap-1.5 rounded-xl bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  <PlayCircle size={14} />
                  Approve Request
                </Button>
              )}

              {isInProgress && (
                <Button
                  onClick={() => handleStatusChange("completed")}
                  disabled={isUpdatingStatus}
                  className="h-9 gap-1.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  <CheckCircle2 size={14} />
                  Mark Complete
                </Button>
              )}

              {statusKey !== "cancelled" && statusKey !== "completed" && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={isUpdatingStatus}
                  className="h-9 gap-1.5 rounded-xl border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
                >
                  <XCircle size={14} />
                  Cancel Request
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details & Property (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Request Information Card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs dark:border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wrench size={18} className="text-indigo-600 dark:text-indigo-400" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Service Category
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {request.service_type}
                  {request.sub_category ? ` - ${request.sub_category}` : ""}
                </p>
              </div>

              {request.custom_title && (
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Subject / Custom Title
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {request.custom_title}
                  </p>
                </div>
              )}

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Created On
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {formattedDate}
                </p>
              </div>

              {request.description && (
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Description
                  </span>
                  <p className="mt-1 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap dark:bg-slate-800/60 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    {request.description}
                  </p>
                </div>
              )}

              {request.image_url && (
                <div className="pt-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                    Attached Photo
                  </span>
                  <a
                    href={resolveMediaUrl(request.image_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 max-w-[280px]"
                  >
                    <img
                      src={resolveMediaUrl(request.image_url)}
                      alt="Service issue"
                      className="h-36 w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium gap-1">
                      <ExternalLink size={14} /> View Full Photo
                    </div>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property & Resident Details Card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs dark:border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Home size={18} className="text-indigo-600 dark:text-indigo-400" />
                Property & Resident
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-sm">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Resident Name
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {request.requestor_name || "Resident"}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Unit Location
                </span>
                {request.unit_number ? (
                  <p className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                    <Home size={14} className="text-slate-400" />
                    Unit {request.unit_number} • {request.block_name || "Block"}
                  </p>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-amber-50 p-2 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <AlertCircle size={14} /> Not assigned to a property
                  </div>
                )}
              </div>

              {request.association_name && (
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Association
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <Building2 size={14} className="text-slate-400" />
                    {request.association_name}
                  </p>
                </div>
              )}

              {(request.requestor_phone || request.requestor_email) && (
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {request.requestor_phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Phone size={13} className="text-slate-400" />
                      <span>{request.requestor_phone}</span>
                    </div>
                  )}
                  {request.requestor_email && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
                      <Mail size={13} className="text-slate-400" />
                      <span>{request.requestor_email}</span>
                    </div>
                  )}
                </div>
              )}

              {request.incoming_call_no && (
                <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-medium">
                  📞 Reported via call: {request.incoming_call_no}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Discussion & Activity (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs dark:border-slate-800 flex flex-col h-[640px]">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
                Discussion & Updates
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                {messages.length} message{messages.length === 1 ? "" : "s"}
              </Badge>
            </CardHeader>

            {/* Messages Thread */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {isMessagesLoading ? (
                <div className="flex h-48 items-center justify-center text-xs text-slate-400">
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  <MessageSquare size={28} className="mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">No messages yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Send a question or status update using the form below.
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
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
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
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
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
                                  className="max-h-40 object-cover rounded-lg"
                                />
                              </a>
                            ) : (
                              <a
                                href={resolveMediaUrl(msg.attachment_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 underline text-[11px] text-indigo-100 hover:text-white"
                              >
                                <Paperclip size={12} /> View Attached File
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
            </CardContent>

            {/* Composer Footer */}
            <div className="border-t border-slate-100 p-3.5 dark:border-slate-800">
              {selectedFile && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="truncate max-w-[240px] text-slate-700 dark:text-slate-200">
                    📎 {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
                  className="h-10 w-10 text-slate-400 hover:text-slate-600 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || isUploading}
                  title="Attach file or photo"
                >
                  <Paperclip size={18} />
                </Button>

                <Input
                  placeholder="Type a message or response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending || isUploading}
                  className="flex-1 text-xs h-10 rounded-xl"
                />

                <Button
                  type="submit"
                  className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-xs font-semibold shadow-xs"
                  disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
                >
                  <Send size={14} className="mr-1.5" />
                  {isSending || isUploading ? "Sending..." : "Send"}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
