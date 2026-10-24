import React from "react";

import { FinancialReportImportModal } from "@/components/common";
import { useImportPrepaidReportMutation } from "../api";

interface Props {
  isOpen: boolean;
  associationId: string;
  initialPeriod: string;
  onClose: () => void;
  onImported: (period: string) => void;
}

export const PrepaidReportImportModal: React.FC<Props> = ({
  isOpen,
  associationId,
  initialPeriod,
  onClose,
  onImported,
}) => {
  const [importReport, importState] = useImportPrepaidReportMutation();

  return (
    <FinancialReportImportModal
      isOpen={isOpen}
      reportName="Prepaid Report"
      initialPeriod={initialPeriod}
      templateEndpoint="/prepaid-reports/template"
      templateFilename="prepaid_report_import_template.xlsx"
      columnsDescription="Member, unit, block, category, prepaid amount, used amount, and expiry date."
      isSubmitting={importState.isLoading}
      onImport={({ fiscalPeriod, file }) =>
        importReport({ associationId, fiscalPeriod, file }).unwrap()
      }
      onClose={onClose}
      onImported={onImported}
    />
  );
};
