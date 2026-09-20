import React, { useState, useEffect } from "react";
import {
  Wrench,
  Building,
  Mail,
  Phone,
  MapPin,
  Star,
  FileText,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  Globe,
  Clock,
  Calendar,
  Layers,
  User,
} from "lucide-react";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common";
import type { Vendor } from "../types";

export interface ViewVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onEdit?: (vendor: Vendor) => void;
}

export const ViewVendorModal: React.FC<ViewVendorModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onEdit,
}) => {
  const [lastVendor, setLastVendor] = useState<Vendor | null>(vendor);

  useEffect(() => {
    if (vendor) {
      setLastVendor(vendor);
    }
  }, [vendor]);

  const activeVendor = vendor || lastVendor;
  if (!activeVendor) return null;

  const displayName =
    activeVendor.name || activeVendor.business_name || "Vendor";
  const rating = parseFloat(String(activeVendor.vendor_rating || 0)) || 0;

  // Render Services Offered
  const renderServices = () => {
    let services: any[] = [];
    if (activeVendor.services_offered_json) {
      try {
        const parsed =
          typeof activeVendor.services_offered_json === "string"
            ? JSON.parse(activeVendor.services_offered_json)
            : activeVendor.services_offered_json;
        if (Array.isArray(parsed) && parsed.length > 0) {
          services = parsed;
        }
      } catch {
        // Ignore parsing errors
      }
    }

    if (services.length === 0) {
      if (activeVendor.vendor_category || activeVendor.service_type) {
        services = [
          {
            category:
              activeVendor.vendor_category ||
              activeVendor.service_type ||
              "General",
            subcategory:
              activeVendor.service_type !== activeVendor.vendor_category
                ? activeVendor.service_type
                : undefined,
            available_days: activeVendor.available_days,
            working_hours: activeVendor.working_hours,
            emergency: activeVendor.emergency_service,
            support_24_7: activeVendor.support_24_7,
          },
        ];
      } else {
        return (
          <span className="text-xs text-slate-400 italic">
            No services specified
          </span>
        );
      }
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((s, i) => (
          <div
            key={i}
            className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {s.category || "Service"}
              </span>
              <Wrench size={14} className="text-indigo-600" />
            </div>

            {s.subcategory && (
              <div className="text-slate-600">
                <span className="text-slate-400">Specialization: </span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(s.subcategory)
                    ? s.subcategory.join(", ")
                    : s.subcategory}
                </span>
              </div>
            )}

            {(s.available_days || s.working_hours) && (
              <div className="text-slate-600 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                {s.available_days && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-slate-400" />
                    {s.available_days}
                  </span>
                )}
                {s.available_days && s.working_hours && <span>•</span>}
                {s.working_hours && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-slate-400" />
                    {s.working_hours}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {s.emergency && (
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-md text-[10px] font-semibold">
                  Emergency On-Call
                </span>
              )}
              {s.support_24_7 && (
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md text-[10px] font-semibold">
                  24/7 Support
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Contact Persons
  const renderContacts = () => {
    let contacts: any[] = [];
    if (activeVendor.contact_details_json) {
      try {
        const parsed =
          typeof activeVendor.contact_details_json === "string"
            ? JSON.parse(activeVendor.contact_details_json)
            : activeVendor.contact_details_json;
        if (Array.isArray(parsed) && parsed.length > 0) {
          contacts = parsed;
        }
      } catch {
        // Ignore parsing errors
      }
    }

    if (contacts.length === 0) {
      if (
        activeVendor.contact_person ||
        activeVendor.contact_number ||
        activeVendor.mobile_number
      ) {
        contacts = [
          {
            name: activeVendor.contact_person || activeVendor.name,
            role: "Primary Contact",
            mobile:
              activeVendor.contact_number || activeVendor.mobile_number,
          },
        ];
      } else {
        return (
          <span className="text-xs text-slate-400 italic">
            No contacts specified
          </span>
        );
      }
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contacts.map((c, i) => (
          <div
            key={i}
            className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">
                {c.name || "Contact"}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                {c.role || c.designation || "Contact"}
              </span>
            </div>
            {c.mobile && (
              <div className="text-xs font-medium text-slate-700 mt-1.5 flex items-center gap-1.5">
                <Phone size={12} className="text-slate-400 shrink-0" />
                <span>{c.mobile}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const hasDocuments = Boolean(
    activeVendor.gst_certificate_url ||
      activeVendor.pan_card_url ||
      activeVendor.business_license_url ||
      activeVendor.agreement_copy_url ||
      activeVendor.contract_document_url
  );

  const getStatusVariant = (
    status?: string
  ): "success" | "warning" | "danger" | "neutral" => {
    const s = (status || "").toLowerCase();
    if (s === "active") return "success";
    if (s === "draft" || s === "pending" || s === "pending approval")
      return "warning";
    if (s === "suspended" || s === "blacklisted" || s === "inactive")
      return "danger";
    return "neutral";
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={displayName}
      description={
        activeVendor.business_name && activeVendor.business_name !== activeVendor.name
          ? `${activeVendor.business_name} • Contractor Profile`
          : "Approved Contractor / Service Agency"
      }
      icon={
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
      }
      badge={
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeVendor.vendor_code && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {activeVendor.vendor_code}
            </span>
          )}
          <StatusPill
            status={activeVendor.status || "Active"}
            variant={getStatusVariant(activeVendor.status)}
            shape="pill"
            size="xs"
            dot={true}
          >
            {activeVendor.status || "Active"}
          </StatusPill>
          {activeVendor.verified_vendor && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
          {activeVendor.preferred_vendor && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Preferred
            </span>
          )}
          {rating > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-200/50">
              <Star size={11} className="fill-amber-500 text-amber-500" />
              {rating} / 5.0
            </span>
          )}
        </div>
      }
      size="2xl"
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
                onEdit(activeVendor);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold px-4 cursor-pointer shadow-xs"
            >
              Edit Vendor
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Contact Details & Office Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contacts info */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Mail size={12} />
              Communication
            </p>
            <div className="space-y-1.5 text-xs">
              {activeVendor.email && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{activeVendor.email}</span>
                </div>
              )}
              {(activeVendor.contact_number || activeVendor.mobile_number) && (
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>
                    {activeVendor.contact_number || activeVendor.mobile_number}
                  </span>
                </div>
              )}
              {activeVendor.whatsapp_number && (
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <Phone size={13} className="text-emerald-500 shrink-0" />
                  <span>WhatsApp: {activeVendor.whatsapp_number}</span>
                </div>
              )}
              {activeVendor.website && (
                <div className="flex items-center gap-2 text-indigo-600">
                  <Globe size={13} className="text-indigo-400 shrink-0" />
                  <a
                    href={activeVendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    {activeVendor.website}
                  </a>
                </div>
              )}
              {!activeVendor.email &&
                !activeVendor.contact_number &&
                !activeVendor.mobile_number && (
                  <span className="text-slate-400 italic">No contact details</span>
                )}
            </div>
          </div>

          {/* Location info */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={12} />
              Registered Address
            </p>
            <div className="text-xs text-slate-700 space-y-0.5 leading-relaxed">
              {activeVendor.address_line_1 ||
              activeVendor.address_line_2 ||
              activeVendor.address ||
              activeVendor.city ||
              activeVendor.state ||
              activeVendor.country ||
              activeVendor.zip_code ? (
                <>
                  {activeVendor.address_line_1 && (
                    <div>{activeVendor.address_line_1}</div>
                  )}
                  {activeVendor.address_line_2 && (
                    <div>{activeVendor.address_line_2}</div>
                  )}
                  {!activeVendor.address_line_1 &&
                    !activeVendor.address_line_2 &&
                    activeVendor.address && <div>{activeVendor.address}</div>}
                  <div>
                    {[
                      activeVendor.city,
                      activeVendor.state,
                      activeVendor.zip_code,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  {activeVendor.country && <div>{activeVendor.country}</div>}
                </>
              ) : (
                <span className="text-slate-400 italic">
                  Address not provided
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Services Offered */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Layers size={13} />
            Services Offered
          </p>
          {renderServices()}
        </div>

        {/* Key Contact Persons */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <User size={13} />
            Key Contact Persons
          </p>
          {renderContacts()}
        </div>

        {/* Business & Bank Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Business & Tax Details */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2 text-xs">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building size={12} />
              Tax & Legal Information
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">GSTIN:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {activeVendor.gst_number || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">PAN:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {activeVendor.pan_number || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Experience:</span>
                <span className="font-semibold text-slate-800">
                  {activeVendor.years_of_experience
                    ? `${activeVendor.years_of_experience} years`
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Bank & Settlement Details */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2 text-xs">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <CreditCard size={12} />
              Bank & Settlement Account
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bank:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                  {activeVendor.bank_name || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Account:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {activeVendor.bank_account_number || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">IFSC / UPI:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {activeVendor.bank_ifsc_code || activeVendor.bank_upi_id || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        {hasDocuments && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText size={13} />
              Attached Documents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeVendor.gst_certificate_url && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    GST Certificate
                  </span>
                  <a
                    href={activeVendor.gst_certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {activeVendor.pan_card_url && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">PAN Card</span>
                  <a
                    href={activeVendor.pan_card_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {activeVendor.business_license_url && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    Business License
                  </span>
                  <a
                    href={activeVendor.business_license_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {(activeVendor.agreement_copy_url ||
                activeVendor.contract_document_url) && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    Agreement / Contract
                  </span>
                  <a
                    href={
                      activeVendor.agreement_copy_url ||
                      activeVendor.contract_document_url ||
                      "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Associated Association */}
        {activeVendor.association_name && (
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building size={14} className="text-indigo-600" />
              <span className="text-slate-600">Assigned Association:</span>
              <span className="font-bold text-indigo-900">
                {activeVendor.association_name}
              </span>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default ViewVendorModal;
