export interface DocumentOption {
  id: number;
  label: string;
}

export const DOCUMENT_TYPES: DocumentOption[] = [
  { id: 1, label: "Legal" },
  { id: 2, label: "Committee" },
  { id: 3, label: "Finance" },
  { id: 4, label: "Meetings" },
  { id: 5, label: "Residents" },
  { id: 6, label: "Maintenance" },
  { id: 7, label: "Vendors" },
  { id: 8, label: "Security" },
  { id: 9, label: "Events" },
  { id: 10, label: "Compliance" },
  { id: 11, label: "Insurance" },
  { id: 12, label: "Forms" },
  { id: 13, label: "Policies" },
  { id: 14, label: "Other" },
];

export const DOCUMENT_CATEGORIES: Record<number, DocumentOption[]> = {
  1: [
    { id: 101, label: "Society Registration Certificate" },
    { id: 102, label: "Association Bylaws" },
    { id: 103, label: "Memorandum of Association (MOA)" },
    { id: 104, label: "Articles of Association (AOA)" },
    { id: 105, label: "PAN Card" },
    { id: 106, label: "GST Certificate" },
    { id: 107, label: "Trust Deed" },
    { id: 108, label: "RERA Documents" },
    { id: 109, label: "Property Ownership Documents" },
    { id: 110, label: "NOC Documents" },
  ],
  2: [
    { id: 201, label: "Committee Member List" },
    { id: 202, label: "Appointment Letter" },
    { id: 203, label: "Resignation Letter" },
    { id: 204, label: "Committee Resolution" },
    { id: 205, label: "Election Results" },
    { id: 206, label: "Committee Meeting Minutes" },
  ],
  3: [
    { id: 301, label: "Annual Budget" },
    { id: 302, label: "Balance Sheet" },
    { id: 303, label: "Income & Expense Report" },
    { id: 304, label: "Audit Report" },
    { id: 305, label: "Bank Statements" },
    { id: 306, label: "Tax Returns" },
    { id: 307, label: "Vendor Invoices" },
    { id: 308, label: "Payment Receipts" },
  ],
  4: [
    { id: 401, label: "Meeting Agenda" },
    { id: 402, label: "Meeting Minutes (MOM)" },
    { id: 403, label: "Attendance Sheet" },
    { id: 404, label: "Presentation" },
    { id: 405, label: "Action Items" },
  ],
  5: [
    { id: 501, label: "Resident Agreement" },
    { id: 502, label: "Owner KYC" },
    { id: 503, label: "Tenant Verification" },
    { id: 504, label: "ID Proof" },
    { id: 505, label: "Address Proof" },
    { id: 506, label: "Vehicle Registration" },
    { id: 507, label: "Parking Allocation Letter" },
  ],
  6: [
    { id: 601, label: "AMC Contracts" },
    { id: 602, label: "Service Agreements" },
    { id: 603, label: "Lift Maintenance Report" },
    { id: 604, label: "Fire Safety Certificate" },
    { id: 605, label: "Water Tank Cleaning Report" },
    { id: 606, label: "Pest Control Report" },
    { id: 607, label: "Equipment Warranty" },
  ],
  7: [
    { id: 701, label: "Vendor Agreement" },
    { id: 702, label: "Quotation" },
    { id: 703, label: "Purchase Order" },
    { id: 704, label: "Invoice" },
    { id: 705, label: "Work Completion Certificate" },
    { id: 706, label: "Insurance Certificate" },
    { id: 707, label: "Vendor License" },
  ],
  8: [
    { id: 801, label: "Emergency Contact List" },
    { id: 802, label: "Security SOP" },
    { id: 803, label: "CCTV Maintenance Report" },
    { id: 804, label: "Visitor Policy" },
    { id: 805, label: "Incident Report" },
  ],
  9: [
    { id: 901, label: "Event Proposal" },
    { id: 902, label: "Event Budget" },
    { id: 903, label: "Event Schedule" },
    { id: 904, label: "Sponsor Agreement" },
    { id: 905, label: "Event Photos" },
    { id: 906, label: "Event Report" },
  ],
  10: [
    { id: 1001, label: "Fire NOC" },
    { id: 1002, label: "Pollution Certificate" },
    { id: 1003, label: "Electrical Safety Certificate" },
    { id: 1004, label: "Building Insurance" },
    { id: 1005, label: "Lift License" },
    { id: 1006, label: "Occupancy Certificate" },
  ],
  11: [
    { id: 1101, label: "Building Insurance" },
    { id: 1102, label: "Equipment Insurance" },
    { id: 1103, label: "Public Liability Insurance" },
    { id: 1104, label: "Claim Documents" },
  ],
  12: [
    { id: 1201, label: "Forms" },
    { id: 1202, label: "Templates" },
  ],
  13: [{ id: 1301, label: "Policies" }],
  14: [
    { id: 1401, label: "Circulars" },
    { id: 1402, label: "Notices" },
    { id: 1403, label: "Newsletters" },
    { id: 1404, label: "Other Documents" },
  ],
};

export const VISIBILITY_OPTIONS: DocumentOption[] = [
  { id: 1, label: "Public" },
  { id: 2, label: "Residents" },
  { id: 3, label: "Committee" },
  { id: 4, label: "Board Member" },
  { id: 5, label: "Admin Only" },
];

export const MODULE_OPTIONS: DocumentOption[] = [
  { id: 1, label: "Meeting" },
  { id: 2, label: "Event" },
  { id: 3, label: "Committee" },
  { id: 4, label: "Resident" },
  { id: 5, label: "Vendor" },
  { id: 6, label: "Service Request" },
  { id: 7, label: "Other" },
];

export const STATUS_OPTIONS: DocumentOption[] = [
  { id: 1, label: "Draft" },
  { id: 2, label: "Active" },
  { id: 3, label: "Archived" },
  { id: 4, label: "Expired" },
];

export const getOptionId = (
  options: DocumentOption[],
  label?: string | null,
): number | undefined => {
  const option = options.find((item) => item.label === label);
  return option?.id;
};

export const getOptionLabel = (
  options: DocumentOption[],
  id?: number,
): string | undefined => {
  const option = options.find((item) => item.id === id);
  return option?.label;
};
