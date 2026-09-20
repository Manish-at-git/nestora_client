import React, { useState } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import {
  useGetBankAccountsQuery,
} from "../api/bankApi";
import { BankTable, BankFormModal, ViewBankModal } from "../components";
import type { BankAccount } from "../types";

export const BankPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();

  usePageHeader({
    title: "Bank Accounts",
    description: "Manage association operating accounts, payment gateway credentials, and automated settlement rules.",
  });

  const { data: accounts = [], isLoading, refetch } = useGetBankAccountsQuery(undefined, {
    skip: !canView,
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
  const [accountToView, setAccountToView] = useState<BankAccount | null>(null);

  const handleOpenCreate = () => {
    setAccountToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (account: BankAccount) => {
    setAccountToEdit(account);
    setIsFormModalOpen(true);
  };

  const handleView = (account: BankAccount) => {
    setAccountToView(account);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Bank Accounts" showAction />;
  }

  return (
    <div className="space-y-6">
      <BankTable
        accounts={accounts}
        isLoading={isLoading}
        onAdd={handleOpenCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDeleted={() => refetch()}
      />

      {/* Add / Edit Form Modal */}
      <BankFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setAccountToEdit(null);
        }}
        accountToEdit={accountToEdit}
        onSuccess={() => refetch()}
      />

      {/* View Bank Modal */}
      <ViewBankModal
        isOpen={Boolean(accountToView)}
        onClose={() => setAccountToView(null)}
        account={accountToView}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default BankPage;
