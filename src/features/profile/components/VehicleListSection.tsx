import React from "react";
import { Car, Bike, Plus, Edit2, Trash2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { Vehicle } from "../types";

export interface VehicleListSectionProps {
  vehicles: Vehicle[];
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicle: Vehicle) => void;
}

export const VehicleListSection: React.FC<VehicleListSectionProps> = ({
  vehicles = [],
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
}) => {
  const getVehicleIcon = (type?: string) => {
    const cleanType = (type || "").toLowerCase();
    if (cleanType.includes("bike") || cleanType.includes("motorcycle") || cleanType.includes("cycle")) {
      return <Bike size={18} className="text-indigo-600" />;
    }
    return <Car size={18} className="text-indigo-600" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#232C3E]/10 text-[#232C3E] flex items-center justify-center shrink-0 border border-[#232C3E]/20">
            <Car size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-slate-900 leading-tight">
                Vehicle Information
              </h3>
            </div>
          </div>
        </div>

        <Button
          onClick={onAddVehicle}
          className="h-9 w-9 p-0 bg-[#232C3E] hover:bg-[#232C3E]/90 text-white rounded-xl shadow-xs cursor-pointer"
          title="Add Vehicle"
        >
          <Plus size={16} />
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles registered"
          description="Register your personal or household vehicles to receive association parking permits and gate passes."
          className="py-10"
        />
      ) : (
        <div className="space-y-3.5">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/90 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {getVehicleIcon(v.type)}
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm text-slate-900 tracking-wide">
                      {v.registration_number}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        {v.type || "Vehicle"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => onEditVehicle(v)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                    title="Edit Vehicle"
                  >
                    <Edit2 size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDeleteVehicle(v)}
                    className="h-8 w-8 p-0 text-slate-400 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Delete Vehicle"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              {(v.insurance_url || v.puc_url) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60">
                  {v.insurance_url && (
                    <a
                      href={v.insurance_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 transition-colors"
                    >
                      <FileText size={13} />
                      <span>Insurance Policy</span>
                      <ExternalLink size={11} className="opacity-60" />
                    </a>
                  )}

                  {v.puc_url && (
                    <a
                      href={v.puc_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 transition-colors"
                    >
                      <FileText size={13} />
                      <span>PUC Certificate</span>
                      <ExternalLink size={11} className="opacity-60" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleListSection;
