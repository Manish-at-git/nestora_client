import React from "react";
import { Building, MapPin } from "lucide-react";
import { AdminAssociation } from "../types";

export interface AssociationCardProps {
  association: AdminAssociation;
  onClick: () => void;
  isSelected?: boolean;
}

export const AssociationCard: React.FC<AssociationCardProps> = ({
  association,
  onClick,
  isSelected = false,
}) => {
  const fullAddress =
    [
      association.address_line_1,
      association.city,
      association.state,
      association.country,
    ]
      .filter(Boolean)
      .join(", ") || "No Address Provided";

  const isActive =
    association.is_active === true ||
    association.is_active === 1 ||
    association.status?.toLowerCase() === "active";

  const unitsCount = association.unit_count ?? association.total_units ?? 0;
  const planName = association.plan_name ?? association.plan_tier ?? "Standard";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded-2xl p-6 transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden bg-white shadow-xs ${
        isSelected
          ? "border-indigo-400 shadow-md ring-2 ring-indigo-500/20"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-lg"
      }`}
    >
      {/* Accent strip on hover or selected */}
      <div
        className={`absolute top-0 left-0 w-1.5 h-full bg-indigo-600 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <div>
        {/* Top bar: Icon and Status Badge */}
        <div className="flex justify-between items-start">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
            }`}
          >
            <Building size={24} />
          </div>

          <span
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Association Name and Address */}
        <div className="mt-4">
          <h3
            className="text-lg font-semibold text-slate-800 group-hover:text-indigo-900 line-clamp-1 transition-colors"
            title={association.name}
          >
            {association.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin size={14} className="shrink-0 text-slate-400" />
            <span className="line-clamp-1">{fullAddress}</span>
          </div>
        </div>
      </div>

      {/* Footer Info: Units and Plan */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
            UNITS
          </p>
          <p className="text-sm font-semibold text-slate-700">{unitsCount}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
            PLAN
          </p>
          <p className="text-sm font-semibold text-slate-700">{planName}</p>
        </div>
      </div>
    </button>
  );
};

export default AssociationCard;
