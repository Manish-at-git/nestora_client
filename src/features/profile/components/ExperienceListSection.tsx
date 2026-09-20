import React from "react";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  FileText,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { Experience } from "../types";

export interface ExperienceListSectionProps {
  experience: Experience[];
  onAddExperience: () => void;
  onEditExperience: (exp: Experience) => void;
  onDeleteExperience: (exp: Experience) => void;
}

export const ExperienceListSection: React.FC<ExperienceListSectionProps> = ({
  experience = [],
  onAddExperience,
  onEditExperience,
  onDeleteExperience,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#232C3E]/10 text-[#232C3E] flex items-center justify-center shrink-0 border border-[#232C3E]/20">
            <Briefcase size={20} />
          </div>
          <div>
            <h3 className="text-base font-medium text-slate-900 leading-tight">
              Work Experience
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Professional history, roles, employment, and credentials
            </p>
          </div>
        </div>

        <Button
          onClick={onAddExperience}
          className="h-9 w-9 p-0 bg-[#232C3E] hover:bg-[#232C3E]/90 text-white rounded-xl shadow-xs cursor-pointer"
          title="Add Experience"
        >
          <Plus size={16} />
        </Button>
      </div>

      {experience.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience records added"
          description="Add your professional experience, previous roles, and career history."
          className="py-10"
        />
      ) : (
        <div className="space-y-3.5">
          {experience.map((exp) => (
            <div
              key={exp.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/90 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs text-[#232C3E] mt-0.5">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {exp.job_title}
                      </span>
                      {exp.employment_type && (
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                          {exp.employment_type}
                        </span>
                      )}
                      {exp.currently_working && (
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Current Role
                        </span>
                      )}
                      {exp.work_mode && (
                        <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {exp.work_mode}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 size={13} className="text-slate-400" />
                        {exp.company}
                      </span>
                      {exp.industry && (
                        <span>• {exp.industry}</span>
                      )}
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => onEditExperience(exp)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                    title="Edit Experience"
                  >
                    <Edit2 size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDeleteExperience(exp)}
                    className="h-8 w-8 p-0 text-slate-400 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Delete Experience"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              {(exp.start_date || exp.end_date || exp.currently_working || exp.certificate_url || exp.website_url) && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-3">
                    {(exp.start_date || exp.end_date || exp.currently_working) && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={13} className="text-slate-400" />
                        <span>
                          {exp.start_date || "N/A"} —{" "}
                          {exp.currently_working ? (
                            <span className="text-emerald-700 font-semibold">Present</span>
                          ) : (
                            exp.end_date || "N/A"
                          )}
                        </span>
                      </div>
                    )}

                    {exp.website_url && (
                      <a
                        href={exp.website_url.startsWith("http") ? exp.website_url : `https://${exp.website_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        <Globe size={13} className="text-slate-400" />
                        <span>Company Website</span>
                      </a>
                    )}
                  </div>

                  {exp.certificate_url && (
                    <a
                      href={exp.certificate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 transition-colors shrink-0"
                    >
                      <FileText size={13} />
                      <span>Experience Certificate</span>
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

export default ExperienceListSection;
