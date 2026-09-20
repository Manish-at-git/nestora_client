import React, { useState } from "react";
import {
  Megaphone,
  Calendar as CalendarIcon,
  CheckSquare,
  Send,
} from "lucide-react";

export interface QuickPostPublisherProps {
  postText: string;
  onPostTextChange: (text: string) => void;
  onPublish: (title: string) => void;
  onOpenAnnouncementModal: () => void;
  onOpenEventModal: () => void;
  onOpenPollModal: () => void;
}

export const QuickPostPublisher: React.FC<QuickPostPublisherProps> = ({
  postText,
  onPostTextChange,
  onPublish,
  onOpenAnnouncementModal,
  onOpenEventModal,
  onOpenPollModal,
}) => {
  const [isPublishMenuOpen, setIsPublishMenuOpen] = useState(false);

  const handleSelectTemplate = (title: string) => {
    setIsPublishMenuOpen(false);
    onPublish(title);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">
      <textarea
        className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-0 resize-none text-slate-800 placeholder-slate-400 focus:outline-none"
        rows={3}
        placeholder="Share an announcement with the community..."
        value={postText}
        onChange={(e) => onPostTextChange(e.target.value)}
      />
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex gap-2">
          <button
            onClick={onOpenAnnouncementModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <Megaphone size={14} className="text-blue-500" /> Announcement
          </button>
          <button
            onClick={onOpenEventModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <CalendarIcon size={14} className="text-emerald-500" /> Event
          </button>
          <button
            onClick={onOpenPollModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <CheckSquare size={14} className="text-purple-500" /> Poll
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsPublishMenuOpen(!isPublishMenuOpen)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Publish <Send size={12} />
          </button>

          {isPublishMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-10 py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Title
              </div>
              <button
                onClick={() => handleSelectTemplate("Community Update")}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Community Update
              </button>
              <button
                onClick={() => handleSelectTemplate("Board Update")}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Board Update
              </button>
              <button
                onClick={() => handleSelectTemplate("Thought of the day")}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Thought of the day
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickPostPublisher;

