import React from "react";
import { Dog, Plus, Edit2, Trash2, FileText, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { Pet } from "../types";

export interface PetListSectionProps {
  pets: Pet[];
  onAddPet: () => void;
  onEditPet: (pet: Pet) => void;
  onDeletePet: (pet: Pet) => void;
}

export const PetListSection: React.FC<PetListSectionProps> = ({
  pets = [],
  onAddPet,
  onEditPet,
  onDeletePet,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#232C3E]/10 text-[#232C3E] flex items-center justify-center shrink-0 border border-[#232C3E]/20">
            <Dog size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-slate-900 leading-tight">
                Pet Information
              </h3>
            </div>
          </div>
        </div>

        <Button
          onClick={onAddPet}
          className="h-9 w-9 p-0 bg-[#232C3E] hover:bg-[#232C3E]/90 text-white rounded-xl shadow-xs cursor-pointer"
          title="Add Pet"
        >
          <Plus size={16} />
        </Button>
      </div>

      {pets.length === 0 ? (
        <EmptyState
          icon={Dog}
          title="No pets registered"
          description="Register your household pets to keep community records and vaccination details up to date."
          className="py-10"
        />
      ) : (
        <div className="space-y-3.5">
          {pets.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/90 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs text-[#232C3E]">
                    <Dog size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{p.name}</span>
                      {p.vaccinated && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-full">
                          <CheckCircle2 size={11} /> Vaccinated
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        {p.type || "Pet"} {p.breed ? `• ${p.breed}` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => onEditPet(p)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-[#232C3E] hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Edit Pet"
                  >
                    <Edit2 size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDeletePet(p)}
                    className="h-8 w-8 p-0 text-slate-400 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Delete Pet"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              {(p.vaccination_date || p.reminder_date || p.vaccination_certificate_url) && (
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {p.vaccination_date && (
                        <div>
                          <span className="text-slate-400 font-medium">Last vaccinated: </span>
                          <span className="font-semibold text-slate-800">
                            {new Date(p.vaccination_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {p.reminder_date && (
                        <div>
                          <span className="text-slate-400 font-medium">Next reminder: </span>
                          <span className="font-semibold text-slate-800">
                            {new Date(p.reminder_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {p.vaccination_certificate_url && (
                      <a
                        href={p.vaccination_certificate_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 transition-colors shrink-0"
                      >
                        <FileText size={13} />
                        <span>Vaccination Certificate</span>
                        <ExternalLink size={11} className="opacity-60" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetListSection;
