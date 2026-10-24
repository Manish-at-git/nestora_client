import React from "react";

import { FinancialReportImportModal } from "@/components/common";
import { useImportDelinquencyReportMutation } from "../api";

interface Props {
  isOpen: boolean;
  associationId: string;
  initialPeriod: string;
  onClose: () => void;
  onImported: (period: string) => void;
}

export const DelinquencyReportImportModal: React.FC<Props> = ({
  isOpen,
  associationId,
  initialPeriod,
  onClose,
  onImported,
}) => {
  const [importReport, importState] = useImportDelinquencyReportMutation();

  return (
    <FinancialReportImportModal
      isOpen={isOpen}
      reportName="Delinquency Report"
      initialPeriod={initialPeriod}
      templateEndpoint="/delinquency-reports/template"
      templateFilename="delinquency_report_import_template.xlsx"
      columnsDescription="Include billed and collected totals, member, unit, charge, balance, and aging."
      isSubmitting={importState.isLoading}
      onImport={({ fiscalPeriod, file }) =>
        importReport({ associationId, fiscalPeriod, file }).unwrap()
      }
      onClose={onClose}
      onImported={onImported}
    />
  );
};
