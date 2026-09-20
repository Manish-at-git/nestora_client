import React from "react";
import { BarChart2, Check, Heart, MessageCircle } from "lucide-react";

export interface PollOption {
  id: string | number;
  text?: string;
  option_text?: string;
  vote_count?: number;
  vote_percentage?: number;
}

export interface PollItem {
  id: string | number;
  question?: string;
  description?: string;
  end_date?: string;
  is_multiple_choice?: boolean;
  my_votes?: Array<string | number>;
  options?: PollOption[];
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
  created_at?: string;
  created_by_name?: string;
}

export interface PollCardProps {
  item: PollItem;
  onVote: (
    pollId: string | number,
    optionId: string | number,
    isMultipleChoice?: boolean,
    currentVotes?: Array<string | number>
  ) => void;
  onToggleLike: (id: string | number, userHasLiked?: boolean) => void;
  onOpenComments: (item: { id: string | number; title?: string }) => void;
  formatDate: (isoString?: string) => string;
}

export const PollCard: React.FC<PollCardProps> = ({
  item,
  onVote,
  onToggleLike,
  onOpenComments,
  formatDate,
}) => {
  const isExpired = item.end_date ? new Date(item.end_date) < new Date() : false;
  let canChangeVote = !isExpired;
  if (item.end_date) {
    const twoHoursBeforeEnd = new Date(
      new Date(item.end_date).getTime() - 2 * 60 * 60 * 1000
    );
    if (new Date() >= twoHoursBeforeEnd) {
      canChangeVote = false;
    }
  }

  const hasVoted = Boolean(item.my_votes && item.my_votes.length > 0);
  const showResults = isExpired || hasVoted;

  return (
    <div
      key={`p-${item.id}`}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden"
    >
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm tracking-wide uppercase">
          <BarChart2 size={16} /> Community Poll
        </div>
        {isExpired ? (
          <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
            Closed
          </span>
        ) : (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2">
          {item.question}
        </h3>
        {item.description && (
          <p className="text-slate-600 text-sm mb-5">{item.description}</p>
        )}

        <div className="space-y-3 mb-5">
          {item.options?.map((opt) => {
            const isSelected = item.my_votes?.includes(opt.id);

            if (showResults) {
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (canChangeVote) {
                      onVote(
                        item.id,
                        opt.id,
                        item.is_multiple_choice,
                        item.my_votes || []
                      );
                    }
                  }}
                  disabled={!canChangeVote}
                  className={`relative w-full text-left bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-3 z-0 ${
                    canChangeVote
                      ? "cursor-pointer hover:border-indigo-300 transition-colors"
                      : "cursor-default"
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 -z-10 transition-all duration-1000 ease-out ${
                      isSelected ? "bg-indigo-200" : "bg-indigo-100"
                    }`}
                    style={{ width: `${opt.vote_percentage || 0}%` }}
                  />
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      {isSelected && <Check size={14} className="text-indigo-700" />}
                      <span
                        className={`font-medium ${
                          isSelected ? "text-indigo-700" : "text-slate-700"
                        }`}
                      >
                        {opt.option_text || opt.text}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700">
                      {opt.vote_percentage || 0}%
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={opt.id}
                onClick={() =>
                  onVote(
                    item.id,
                    opt.id,
                    item.is_multiple_choice,
                    item.my_votes || []
                  )
                }
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-${
                    item.is_multiple_choice ? "md" : "full"
                  } border-2 flex items-center justify-center ${
                    isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                  }`}
                >
                  {isSelected && <Check size={14} className="text-white" />}
                </div>
                <span
                  className={`text-sm ${
                    isSelected ? "text-indigo-900 font-semibold" : "text-slate-700"
                  }`}
                >
                  {opt.option_text || opt.text}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex gap-4">
            <button
              onClick={() => onToggleLike(item.id, item.user_has_liked)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
                item.user_has_liked ? "text-red-500" : "text-slate-500 hover:text-red-500"
              }`}
            >
              <Heart size={18} className={item.user_has_liked ? "fill-current" : ""} />{" "}
              {item.like_count || 0}
            </button>
            <button
              onClick={() =>
                onOpenComments({
                  id: item.id,
                  title: item.question,
                })
              }
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <MessageCircle size={18} /> {item.comment_count || 0}
            </button>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            <span>
              {formatDate(item.created_at)} - by {item.created_by_name || "Admin"}
            </span>
            {!isExpired && item.end_date && (
              <span className="ml-2 pl-2 border-l border-slate-200 text-indigo-500">
                Ends {new Date(item.end_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCard;

