import React, { useState, useEffect, useRef } from "react";
import { Search, Send, User } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api/apiClient";

interface SearchUser {
  user_id: string | number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  contact_number?: string;
  activation_code?: string;
}

export const AdminHomeownerSearch: React.FC = () => {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get("/admin/users");
        const list = res.data?.users || res.data || [];
        if (Array.isArray(list)) {
          const validUsers = list.filter((u: any) => u.email && u.activation_code);
          setUsers(validUsers);
        }
      } catch (err) {
        console.error("Failed to fetch users for search", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendCode = async (user: SearchUser) => {
    try {
      setSendingId(user.user_id);
      const res = await apiClient.post(`/admin/users/${user.user_id}/send-code`);
      if (res.data?.ok || res.status === 200) {
        toast.success(`Access code sent to ${user.email}`);
        setIsOpen(false);
        setSearch("");
      }
    } catch (err) {
      console.error("Failed to send access code", err);
      toast.error("Failed to send access code");
    } finally {
      setSendingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return false;
    const term = search.toLowerCase();
    const fullName = `${u.first_name || ""} ${u.last_name || ""} ${u.name || ""}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.contact_number && u.contact_number.includes(term))
    );
  });

  return (
    <div ref={wrapperRef} className={`relative ${isOpen ? "z-30" : "z-10"}`}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={15}
        />
        <input
          type="text"
          placeholder="Search Homeowners..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (search) setIsOpen(true);
          }}
          className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm w-44 sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {isOpen && search && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">
              No homeowners found matching "{search}"
            </div>
          ) : (
            <div className="py-2">
              <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Search Results
              </div>
              {filteredUsers.map((user) => {
                const displayName =
                  `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  user.name ||
                  user.email ||
                  "User";
                return (
                  <div
                    key={user.user_id}
                    className="px-4 py-3 hover:bg-slate-50 flex items-start justify-between group transition-colors border-t border-slate-100 first:border-t-0 gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1 bg-indigo-50 text-indigo-600 rounded-full shrink-0">
                        <User size={13} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-slate-500">{user.email}</div>
                        {user.contact_number && (
                          <div className="text-[11px] text-slate-400">
                            {user.contact_number}
                          </div>
                        )}
                        <div className="mt-1 text-[11px] text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded inline-block">
                          Code: {user.activation_code}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={sendingId === user.user_id}
                      onClick={() => handleSendCode(user)}
                      className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors flex items-center gap-1 font-medium cursor-pointer shrink-0 disabled:opacity-50"
                      title="Send Access Code via Email"
                    >
                      <Send size={11} />
                      {sendingId === user.user_id ? "Sending..." : "Send Code"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminHomeownerSearch;
