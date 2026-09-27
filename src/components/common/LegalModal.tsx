import React, { useEffect, useState } from "react";
import { FileText, Lock, Scale, Shield, UserCheck } from "lucide-react";
import { ModalWrapper } from "./ModalWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "../ui/button";

export type LegalTab = "terms" | "privacy";

export interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
  onAccept?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = "terms",
  onAccept,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      title={activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
      description="Governing Rules and DPDP Act (2023) compliant · Last updated September 2026"
      icon={
        activeTab === "terms" ? <FileText size={19} /> : <Shield size={19} />
      }
      bodyClassName="overflow-hidden p-0"
      footer={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-slate-500">
            By proceeding, you consent to digital processing under the DPDP Act,
            2023.
          </p>
          <div className="flex justify-end gap-2">
            {onAccept ? (
              <Button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                // className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs"
              >
                Accept &amp; Continue
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={onClose}
              // className="btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as LegalTab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="border-b border-slate-200 bg-slate-100/60 px-4 pt-3 sm:px-6">
          <TabsList>
            <TabsTrigger value="terms">
              Terms &amp; Conditions
            </TabsTrigger>
            <TabsTrigger value="privacy">
              Privacy Policy
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-5 text-sm leading-relaxed text-slate-700 sm:p-6">
          {activeTab === "terms" ? <TermsContent /> : <PrivacyContent />}
        </div>
      </Tabs>
    </ModalWrapper>
  );
};

const TermsContent: React.FC = () => (
  <div className="space-y-6">
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Agreement Overview
      </p>
      <p>
        Welcome to <strong>Nestora</strong> (“Platform”, “We”, “Us”, or “Our”).
        By registering, accessing, or using Nestora as a homeowner, resident,
        board member, committee member, or staff member, you agree to these
        Terms and Conditions under the Information Technology Act, 2000, Indian
        Contract Act, 1872, and applicable State Apartment Ownership or
        Co-operative Housing Society Acts.
      </p>
    </div>
    <LegalSection
      icon={<Shield size={18} />}
      title="1. Association Membership & Eligibility"
    >
      <p>
        Access to resident features is restricted to verified unit owners,
        lawful tenants, authorized family members, and designated society
        personnel of participating associations.
      </p>
      <p>
        You agree that information provided during account activation—including
        name, email, contact number, unit number, and vehicle details—is
        truthful, accurate, and kept updated.
      </p>
    </LegalSection>
    <LegalSection
      icon={<UserCheck size={18} />}
      title="2. Account Security & User Conduct"
    >
      <p>
        You are responsible for maintaining the confidentiality of passwords,
        OTPs, wallet PINs, and entry QR codes. Activity originating from your
        account is treated as your responsibility.
      </p>
      <p>
        Users must not post abusive, defamatory, discriminatory, or unlawful
        content, tamper with visitor passes, or impersonate residents or staff.
      </p>
    </LegalSection>
    <LegalSection
      icon={<Scale size={18} />}
      title="3. Financials, Dues & Amenity Bookings"
    >
      <p>
        Dues, assessments, amenity bookings, and maintenance charges shown in
        Nestora are determined by your housing association or managing
        committee.
      </p>
      <p>
        Nestora provides payment integration and ledger tracking. Refunds,
        waivers, and cancellations remain governed by your association’s rules.
      </p>
    </LegalSection>
    <LegalSection
      icon={<Shield size={18} />}
      title="4. Disclaimers & Limitation of Liability"
    >
      <p>
        The Platform is provided on an “as is” and “as available” basis. Nestora
        is not liable for municipal disruptions, association disputes, or
        internet-service outages.
      </p>
      <p>
        Nestora is not liable for indirect or consequential damages arising from
        society amenities or third-party vendor services.
      </p>
    </LegalSection>
    <LegalSection
      icon={<FileText size={18} />}
      title="5. Termination & Governing Law"
    >
      <p>
        When a resident unit is de-registered, sold, or transferred, access to
        association records may be transitioned or closed with the association
        administrator.
      </p>
      <p>These Terms are governed by the laws of India.</p>
    </LegalSection>
  </div>
);

const PrivacyContent: React.FC = () => (
  <div className="space-y-6">
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900">
      <div className="mb-1 flex items-center gap-2 font-semibold">
        <Shield size={18} />
        Digital Personal Data Protection (DPDP) Act, 2023
      </div>
      <p className="text-xs leading-relaxed">
        Nestora safeguards personal data in compliance with the DPDP Act, 2023,
        the Information Technology (Reasonable Security Practices and Procedures
        and Sensitive Personal Data or Information) Rules, 2011, and applicable
        privacy regulations.
      </p>
    </div>
    <LegalSection
      icon={<Lock size={18} />}
      title="1. Data We Collect & Lawful Purpose"
    >
      <p>
        We process personal data only for lawful society administration, safety,
        and resident services.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-slate-600">
        <li>
          <strong>Identity and contact:</strong> name, email, mobile number,
          emergency contacts, and unit allocation.
        </li>
        <li>
          <strong>Access and security:</strong> visitor logs, gate timestamps,
          vehicle numbers, and service-staff credentials.
        </li>
        <li>
          <strong>Financial records:</strong> maintenance payments, transaction
          IDs, wallet balance, and dues receipts.
        </li>
        <li>
          <strong>Community records:</strong> polls, meeting attendance,
          violation reports, and committee assignments.
        </li>
      </ul>
    </LegalSection>
    <LegalSection
      icon={<UserCheck size={18} />}
      title="2. Rights of Data Principals"
    >
      <p>
        Under the DPDP Act, you may request access to a summary of your data,
        correction or erasure where appropriate, grievance redressal, and
        nomination of another person to exercise these rights.
      </p>
    </LegalSection>
    <LegalSection
      icon={<Shield size={18} />}
      title="3. Data Protection & Security Safeguards"
    >
      <p>
        <strong>Encryption and storage:</strong> passwords are cryptographically
        hashed, and sensitive data is transmitted over TLS and stored in
        protected database environments.
      </p>
      <p>
        <strong>No third-party sale:</strong> Nestora does not sell, rent, or
        monetize personal data to advertisers or commercial brokers.
      </p>
      <p>
        <strong>Children’s data:</strong> processing data of individuals under
        18 requires verifiable parent or guardian consent.
      </p>
    </LegalSection>
    <LegalSection
      icon={<FileText size={18} />}
      title="4. Data Fiduciary & Grievance Redressal"
    >
      <p>
        Your housing association or society acts as the{" "}
        <strong>Data Fiduciary</strong>; Nestora operates as the{" "}
        <strong>Data Processor</strong>.
      </p>
      <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
        <p>
          <strong>Grievance and Data Protection Officer:</strong> Privacy &amp;
          Compliance Cell
        </p>
        <p>
          <strong>Email:</strong> privacy@nestora.io / support@nestora.io
        </p>
        <p>
          <strong>Response timeline:</strong> Within 72 hours under applicable
          governing norms.
        </p>
      </div>
    </LegalSection>
  </div>
);

interface LegalSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const LegalSection: React.FC<LegalSectionProps> = ({
  icon,
  title,
  children,
}) => (
  <section className="space-y-2">
    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
      <span className="text-moss">{icon}</span>
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </section>
);

export default LegalModal;
