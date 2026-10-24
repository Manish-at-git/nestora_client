import React from "react";

import { FinancialReportImportModal } from "@/components/common";
import { useImportVendorAgingReportMutation } from "../api";

interface Props {
  isOpen: boolean;
  associationId: string;
  initialPeriod: string;
  onClose: () => void;
  onImported: (period: string) => void;
}

export const VendorAgingReportImportModal: React.FC<Props> = ({
  isOpen,
  associationId,
  initialPeriod,
  onClose,
  onImported,
}) => {
  const [importReport, importState] = useImportVendorAgingReportMutation();

  return (
    <FinancialReportImportModal
      isOpen={isOpen}
      reportName="Vendor Aging Report"
      initialPeriod={initialPeriod}
      templateEndpoint="/vendor-aging-reports/template"
      templateFilename="vendor_aging_report_import_template.xlsx"
      columnsDescription="Vendor, category, invoice, date, and each outstanding aging bucket."
      isSubmitting={importState.isLoading}
      onImport={({ fiscalPeriod, file }) =>
        importReport({ associationId, fiscalPeriod, file }).unwrap()
      }
      onClose={onClose}
      onImported={onImported}
    />
  );
};
