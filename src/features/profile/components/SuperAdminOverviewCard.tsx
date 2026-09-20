import React from "react";
import { Link } from "react-router-dom";
import { Shield, KeyRound, Building2, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SuperAdminOverviewCard: React.FC = () => {
  const capabilities = [
    {
      title: "Granular RBAC Matrix",
      desc: "Configure role-based feature authorizations, CRUD privileges, and matrix policies.",
      icon: <KeyRound size={16} className="text-amber-500" />,
      link: "/permissions",
      linkLabel: "Permissions Matrix",
    },
    {
      title: "Multi-Entity Governance",
      desc: "Provision and oversee HOA communities, Condos, and Platform associations.",
      icon: <Building2 size={16} className="text-emerald-500" />,
      link: "/entities",
      linkLabel: "Manage Entities",
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Platform Governance & Capabilities
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Root privileges and administrative control over the Nestora SaaS ecosystem
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {capabilities.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50/90 transition-colors flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-200/70 shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
            <div className="pt-1 flex justify-end">
              <Link to={item.link}>
                <Button
                  variant="ghost"
                  size="default"
                  className="h-7 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 px-2.5 rounded-lg gap-1 cursor-pointer"
                >
                  <span>{item.linkLabel}</span>
                  <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminOverviewCard;
