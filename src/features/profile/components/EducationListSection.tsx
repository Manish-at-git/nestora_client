import React from "react";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  FileText,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { Education } from "../types";

export interface EducationListSectionProps {
  education: Education[];
  onAddEducation: () => void;
  onEditEducation: (edu: Education) => void;
  onDeleteEducation: (edu: Education) => void;
}

export const EducationListSection: React.FC<EducationListSectionProps> = ({
  education = [],
  onAddEducation,
  onEditEducation,
  onDeleteEducation,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#232C3E]/10 text-[#232C3E] flex items-center justify-center shrink-0 border border-[#232C3E]/20">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="text-base font-medium text-slate-900 leading-tight">
              Education & Qualifications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic background, degrees, diplomas, and credentials
            </p>
          </div>
        </div>

        <Button
          onClick={onAddEducation}
          className="h-9 w-9 p-0 bg-[#232C3E] hover:bg-[#232C3E]/90 text-white rounded-xl shadow-xs cursor-pointer"
          title="Add Education"
        >
          <Plus size={16} />
        </Button>
      </div>

      {education.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education records added"
          description="Add your academic degrees, colleges, certifications, and educational credentials."
          className="py-10"
        />
      ) : (
        <div className="space-y-3.5">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/90 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs text-[#232C3E] mt-0.5">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {edu.degree}
                        {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                      </span>
                      {edu.education_level && (
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                          {edu.education_level}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 size={13} className="text-slate-400" />
                        {edu.institution}
                      </span>
                      {edu.board_university && (
                        <span>• {edu.board_university}</span>
                      )}
                      {edu.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {edu.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => onEditEducation(edu)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                    title="Edit Education"
                  >
                    <Edit2 size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDeleteEducation(edu)}
                    className="h-8 w-8 p-0 text-slate-400 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Delete Education"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              {(edu.start_date || edu.end_date || edu.currently_studying || edu.grade || edu.certificate_url) && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-3">
                    {(edu.start_date || edu.end_date || edu.currently_studying) && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={13} className="text-slate-400" />
                        <span>
                          {edu.start_date || "N/A"} —{" "}
                          {edu.currently_studying ? (
                            <span className="text-emerald-700 font-semibold">Present</span>
                          ) : (
                            edu.end_date || "N/A"
                          )}
                        </span>
                      </div>
                    )}

                    {edu.grade && (
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Award size={13} className="text-amber-500" />
                        <span>Grade / Score: <strong className="text-slate-900">{edu.grade}</strong></span>
                      </div>
                    )}
                  </div>

                  {edu.certificate_url && (
                    <a
                      href={edu.certificate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 transition-colors shrink-0"
                    >
                      <FileText size={13} />
                      <span>Certificate Document</span>
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

export default EducationListSection;
