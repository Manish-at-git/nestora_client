import React, { useState, useEffect } from "react";
import { X, Send, Smile } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api/apiClient";

export interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | number | null;
  itemType?: "announcement" | "event" | "poll";
  itemTitle?: string;
  onCommentAdded?: () => void;
}

interface CommentItem {
  id: string | number;
  user_name?: string;
  author_name?: string;
  comment?: string;
  content?: string;
  body?: string;
  created_at?: string;
  [key: string]: any;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemType = "announcement",
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen && itemId) {
      fetchComments();
    }
  }, [isOpen, itemId, itemType]);

  const fetchComments = async () => {
    try {
      setFetching(true);
      const endpoint =
        itemType === "event"
          ? `/events/${itemId}/comments`
          : itemType === "poll"
          ? `/polls/${itemId}/comments`
          : `/announcements/${itemId}/comments`;
      const { data } = await apiClient.get(endpoint);
      setComments(data?.data || data || []);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen || !itemId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      const endpoint =
        itemType === "event"
          ? `/events/${itemId}/comments`
          : itemType === "poll"
          ? `/polls/${itemId}/comments`
          : `/announcements/${itemId}/comment`;

      await apiClient.post(endpoint, { comment: newComment.trim() });
      setNewComment("");
      fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <h2 className="text-xl font-bold text-slate-800">Comments</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {fetching ? (
            <div className="text-center text-slate-500 py-8">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-slate-800">
                      {c.author_name || c.user_name || "Resident"}
                    </span>
                    <span className="text-slate-400">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {c.comment || c.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white rounded-b-3xl relative">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
