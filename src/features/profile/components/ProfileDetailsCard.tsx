import React, { useState } from "react";
import { Shield, CheckCircle2, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSuperAdmin } from "@/lib/utils";
import { UserDetails, FamilyMember, UnitHomeowner } from "../types";

export interface ProfileDetailsCardProps {
  userDetails: UserDetails;
  familyMembers: FamilyMember[];
  unitHomeowners: UnitHomeowner[];
  isEmployee?: boolean;
  role?: string;
  roleCode?: string;
  defaultEmail?: string;
}

const LabelValuePair: React.FC<{ label: string; value?: React.ReactNode | undefined }> = ({ label, value }) => {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">
        {label}
      </label>
      <div className="text-slate-800 font-medium">{value || "-"}</div>
    </div>
  )
};

export const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({
  userDetails,
  familyMembers = [],
  unitHomeowners = [],
  isEmployee = false,
  role = "Homeowner",
  roleCode,
  defaultEmail,
}) => {
  const [activeTab, setActiveTab] = useState<string>("primary");
  const isSuper = isSuperAdmin(roleCode);

  const currentMember =
    activeTab === "primary"
      ? userDetails
      : familyMembers.find((m) => m.id.toString() === activeTab) ||
      unitHomeowners.find((h) => h.user_id?.toString() === activeTab);

  if (isSuper) {
    const superAdminFields: { label: string; value: React.ReactNode }[] = [
      {
        label: "Administrator Name",
        value: userDetails?.name || "System Administrator",
      },
      {
        label: "Registered Email",
        value: userDetails?.email || defaultEmail || "superadmin@nestora.io",
      },
      {
        label: "Administrative Scope",
        value: "Global Platform (Nestora Root)",
      },
      {
        label: "Contact Number",
        value: userDetails?.contact_number || "-",
      },
      {
        label: "System Role Code",
        value: "super_admin",
      },
      {
        label: "Account Status",
        value: (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
            <CheckCircle2 size={13} /> Active & Verified
          </span>
        ),
      },
    ];

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs mb-8 overflow-hidden">
        <div className="flex border-b border-slate-200/80 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <User size={16} className="text-[#232C3E]" />
            <span>Super Administrator Profile</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {superAdminFields.map((field, idx) => (
              <LabelValuePair key={idx} label={field.label} value={field.value} />
            ))}
          </div>
        </div>
      </div>
    );
  }


  const userFields: { label: string; value: React.ReactNode }[] = [
    {
      label: "Name",
      value: currentMember?.name || "System Administrator",
    },
    {
      label: "Registered Email",
      value: currentMember?.email || defaultEmail || "superadmin@nestora.io",
    },
    {
      label: "Unit Address",
      value: currentMember.address || "-",
    },
    {
      label: "Contact Number",
      value: currentMember?.contact_number || "-",
    },
    {
      label: "Alternative Contact Number",
      value: currentMember?.alt_contact_number || "-",
    }
  ];

  const tabs = [
    { value: "primary", label: isEmployee ? role : "Homeowner", key: 1 },
    ...unitHomeowners.map((ho) => ({ value: ho.user_id.toString(), label: ho.name, key: ho.user_id })),
    ...familyMembers.map((member) => ({ value: member.id.toString(), label: member.name, key: member.id })),
  ];

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm mb-8 overflow-hidden">
      {tabs.length > 1 ? (
      <div className="p-3.5 border-b border-border overflow-x-auto bg-slate-50/50">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-10 rounded-xl bg-slate-100 p-1 flex-wrap gap-1">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.key}
                value={item.value}
                className="rounded-lg text-sm font-normal px-4 py-1.5 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-[#232C3E] data-[state=active]:shadow-xs"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      ) : (
        <div className="flex border-b border-slate-200/80 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <User size={16} className="text-[#232C3E]" />
            <span>{tabs?.[0]?.label} Profile</span>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

          {userFields.map((field, idx) => (
            <LabelValuePair key={idx} label={field.label} value={field.value} />
          ))}

        </div>
      </div>
    </div>
  );
};

export default ProfileDetailsCard;
