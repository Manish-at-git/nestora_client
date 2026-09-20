import React from "react";
import { User, Image as ImageIcon, Calendar, Building } from "lucide-react";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import { BoardTaskStatusBadge } from "./BoardTaskStatusBadge";
import type { BoardTask } from "../types";

export interface BoardTaskCardProps {
  task: BoardTask;
  onClick: (task: BoardTask) => void;
}

export const BoardTaskCard: React.FC<BoardTaskCardProps> = ({ task, onClick }) => {
  const formattedDate = task.created_at
    ? new Date(task.created_at).toLocaleString()
    : "";

  return (
    <div
      onClick={() => onClick(task)}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {task.title}
            </h3>
            {task.association_name && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <Building size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{task.association_name}</span>
              </div>
            )}
          </div>
          <BoardTaskStatusBadge status={task.status} size="sm" />
        </div>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl mb-4 line-clamp-3 leading-relaxed whitespace-pre-wrap border border-slate-100">
          {task.description}
        </p>
      </div>

      {/* Metadata & Footer */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          {/* Supervisor Information */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-[10px]">
              <User size={12} />
            </div>
            <span className="font-medium text-slate-700">
              {task.supervised_by_name || "Unassigned"}
            </span>
            <span className="text-slate-400">(Supervisor)</span>
          </div>

          {/* Attachment indicator if present */}
          {task.image_url && (
            <a
              href={resolveMediaUrl(task.image_url)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ImageIcon size={13} />
              View Attachment
            </a>
          )}
        </div>

        {/* Creator and Created Date */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>By {task.created_by_name || "Admin"}</span>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardTaskCard;
