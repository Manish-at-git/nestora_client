import React, { useState, useEffect } from "react";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Key,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import type { Employee } from "../types";

export interface ViewEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
}

export const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({
  employee,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [lastEmployee, setLastEmployee] = useState<Employee | null>(employee);

  useEffect(() => {
    if (employee) {
      setLastEmployee(employee);
    }
  }, [employee]);

  const activeEmployee = employee || lastEmployee;
  if (!activeEmployee) return null;

  const fullName =
    activeEmployee.first_name || activeEmployee.last_name
      ? `${activeEmployee.first_name || ""} ${activeEmployee.last_name || ""}`.trim()
      : activeEmployee.name ||
        (activeEmployee.email ? activeEmployee.email.split("@")[0] : "Employee");

  const associations = activeEmployee.associations || [];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      description={activeEmployee.role_name || "Platform Staff"}
      icon={
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
          {fullName.charAt(0).toUpperCase()}
        </div>
      }
      badge={
        activeEmployee.employee_id_number ? (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {activeEmployee.employee_id_number}
          </span>
        ) : undefined
      }
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
          >
            Close
          </Button>

          {onEdit && (
            <Button
              onClick={() => {
                onClose();
                onEdit(activeEmployee);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold px-4 cursor-pointer shadow-xs"
            >
              Edit Employee
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Credentials Card */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-900">
              {activeEmployee.temp_password
                ? "Temp Login Password:"
                : "Password status:"}
            </span>
            {activeEmployee.temp_password ? (
              <span className="text-xs font-mono font-bold text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-200">
                {activeEmployee.temp_password}
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-200">
                Password reset
              </span>
            )}
          </div>
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">
              Email Address
            </p>
            <p className="text-xs font-medium text-slate-800 mt-0.5 flex items-center gap-1.5 truncate">
              <Mail size={12} className="text-slate-400" />
              {activeEmployee.email}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">
              Contact Phone
            </p>
            <p className="text-xs font-medium text-slate-800 mt-0.5 flex items-center gap-1.5 truncate">
              <Phone size={12} className="text-slate-400" />
              {activeEmployee.contact_number || "—"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">
              Onboard Date
            </p>
            <p className="text-xs font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" />
              {activeEmployee.onboard_date
                ? new Date(activeEmployee.onboard_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">
              Role Access
            </p>
            <p className="text-xs font-semibold text-indigo-700 mt-0.5 flex items-center gap-1.5">
              <Shield size={12} />
              {activeEmployee.role_name || "Platform Staff"}
            </p>
          </div>
        </div>

        {/* Address Information */}
        {(activeEmployee.address_line_1 ||
          activeEmployee.city ||
          activeEmployee.address) && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <MapPin size={11} />
              Residential Address
            </p>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {activeEmployee.address_line_1
                ? `${activeEmployee.address_line_1}${
                    activeEmployee.address_line_2
                      ? `, ${activeEmployee.address_line_2}`
                      : ""
                  }, ${activeEmployee.city || ""}, ${
                    activeEmployee.state || ""
                  } - ${activeEmployee.pincode || ""}`
                : activeEmployee.address}
            </p>
          </div>
        )}

        {/* Emergency Contact Information */}
        {(activeEmployee.emergency_contact_name ||
          activeEmployee.emergency_contact_number) && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <AlertCircle size={11} className="text-amber-500" />
              Emergency Contact
            </p>
            <div className="flex items-center justify-between text-xs text-slate-800 font-medium">
              <span>{activeEmployee.emergency_contact_name || "—"}</span>
              {activeEmployee.emergency_contact_number && (
                <span className="font-mono text-slate-600 flex items-center gap-1">
                  <Phone size={11} className="text-slate-400" />
                  {activeEmployee.emergency_contact_number}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Government ID Proof Document (if available) */}
        {activeEmployee.id_proof_url && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Government ID Proof
                </p>
                <p className="text-[11px] text-slate-500">
                  Verified document attached
                </p>
              </div>
            </div>
            <a
              href={activeEmployee.id_proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer shadow-2xs"
            >
              <ExternalLink size={13} />
              <span>View Document</span>
            </a>
          </div>
        )}

        {/* Assigned Associations */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Assigned Associations ({associations.length})
          </p>
          {associations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Full platform access / No specific association restricted
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {associations.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-800 border border-slate-200 shadow-xs"
                >
                  <Building size={12} className="text-indigo-600" />
                  <span>{a.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ViewEmployeeModal;
