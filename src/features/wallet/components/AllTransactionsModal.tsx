import React, { useState, useEffect } from "react";
import { ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { WalletTransaction } from "../types";
import { WalletTransactionItem } from "./WalletTransactionItem";

export interface AllTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: WalletTransaction[];
  currencySymbol?: string;
}

export const AllTransactionsModal: React.FC<AllTransactionsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currencySymbol = "₹",
}) => {
  const [txPage, setTxPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(transactions.length / pageSize) || 1;

  const currentSlice = transactions.slice((txPage - 1) * pageSize, txPage * pageSize);

  useEffect(() => {
    if (!isOpen) {
      setTxPage(1);
    }
  }, [isOpen]);

  const handleClose = () => {
    setTxPage(1);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="All Transactions"
      description="Comprehensive transaction statement and payment history."
      size="lg"
      footer={
        transactions.length > pageSize ? (
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={txPage === 1}
              onClick={() => setTxPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <span className="text-xs font-mono font-medium text-slate-500">
              Page {txPage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={txPage === totalPages}
              onClick={() => setTxPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="divide-y divide-slate-100 -mx-6 -my-2 max-h-[60vh] overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="py-12 px-6 text-center text-slate-400 text-xs">
            No transactions recorded yet.
          </div>
        ) : (
          currentSlice.map((tx) => (
            <WalletTransactionItem
              key={tx.id}
              transaction={tx}
              currencySymbol={currencySymbol}
            />
          ))
        )}
      </div>
    </ModalWrapper>
  );
};

export default AllTransactionsModal;
