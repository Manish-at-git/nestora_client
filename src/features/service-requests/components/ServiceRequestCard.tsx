import React from "react";
import {
  Wrench,
  Clock,
  Phone,
  Mail,
  Home,
  MapPin,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_CONFIG, normalizeServiceStatus, type ServiceStatusKey } from "../constants";
import type { ServiceRequest } from "../types";

export interface ServiceRequestCardProps {
  request: ServiceRequest;
  onClick: () => void;
  onUpdateStatus?: (statusKey: ServiceStatusKey) => void;
  onOpenMapModal?: () => void;
  canManageStatus?: boolean;
}

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  request,
  onClick,
  onUpdateStatus,
  onOpenMapModal,
  canManageStatus = false,
}) => {
  const statusKey = normalizeServiceStatus(request.status);
  const statusConfig = STATUS_BADGE_CONFIG[statusKey];

  const isNew = statusKey === "new";
  const isInProgress = statusKey === "in_progress";
  const isUnassigned = !request.association_id || !request.unit_id;

  const formattedDate = request.created_at
    ? new Date(request.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-indigo-500/40 cursor-pointer"
    >
      <div>
        {/* Top Header: ID, Type & Status */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-bold tracking-wide text-indigo-600 dark:text-indigo-400">
              {request.sr_display_id || `SR-#${request.id}`}
            </span>
            <div className="flex items-center gap-1.5">
              <Wrench size={15} className="text-slate-500 dark:text-slate-400" />
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">
                {request.service_type}
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Sub Category or Custom Title */}
        {(request.sub_category || request.custom_title) && (
          <div className="mb-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {request.sub_category || request.custom_title}
            </p>
          </div>
        )}

        {/* Description snippet */}
        {request.description && (
          <p className="mb-3.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {request.description}
          </p>
        )}

        {/* Property & Requester details */}
        <div className="mb-3 space-y-1.5 rounded-xl bg-slate-50/80 p-3 text-xs dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {request.requestor_name || "Unknown Resident"}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            {request.unit_number ? (
              <div className="flex items-center gap-1">
                <Home size={13} className="text-slate-400" />
                <span>
                  Unit {request.unit_number} • {request.block_name || "Block"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <MapPin size={13} />
                <span>Unassigned Property</span>
              </div>
            )}
          </div>

          {/* Contact snippets */}
          {(request.requestor_phone || request.requestor_email) && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {request.requestor_phone && (
                <span className="flex items-center gap-1">
                  <Phone size={11} /> {request.requestor_phone}
                </span>
              )}
              {request.requestor_email && (
                <span className="flex items-center gap-1 truncate max-w-[170px]">
                  <Mail size={11} /> {request.requestor_email}
                </span>
              )}
            </div>
          )}

          {/* Incoming Call indicator */}
          {request.incoming_call_no && (
            <div className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              📞 Reported via call: {request.incoming_call_no}
            </div>
          )}
        </div>
      </div>

      <div
        className="mt-2 border-t border-slate-100 pt-3 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
          <span>View Details & Conversation</span>
          <ChevronRight size={15} />
        </div>
      </div>
    </div>
  );
};
