import React from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface DiscussionMessage {
  id: string;
  senderId: string;
  senderName?: string | null;
  body?: string | null;
  createdAt: string;
}

interface DiscussionThreadProps {
  title: string;
  description?: string;
  messages: DiscussionMessage[];
  currentUserId?: string | null;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
  placeholder?: string;
  emptyMessage?: string;
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  title,
  description,
  messages,
  currentUserId,
  value,
  onChange,
  onSend,
  isSending = false,
  placeholder = "Write a message",
  emptyMessage = "No messages yet. Send a message to start the conversation.",
}) => (
  <Card className="flex min-h-72 flex-col overflow-hidden">
    <div className="border-b border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-indigo-600" />
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </div>
    <div className="min-h-44 flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
      {messages.length === 0 ? (
        <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-5 text-center text-xs text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <p className="mb-1 text-[11px] text-slate-500">
                {isMine ? "You" : message.senderName || "Participant"}
              </p>
              <p className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${isMine ? "bg-slate-900 text-white" : "bg-white text-slate-800 shadow-xs"}`}>
                {message.body}
              </p>
            </div>
          );
        })
      )}
    </div>
    <div className="flex gap-2 border-t border-slate-200 bg-white p-3">
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onSend(); } }} />
      <Button size="icon" disabled={!value.trim() || isSending} onClick={onSend} title="Send message">
        <Send size={16} />
      </Button>
    </div>
  </Card>
);
