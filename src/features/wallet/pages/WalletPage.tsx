import React, { useState } from "react";
import { Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getCurrencySymbol } from "@/utils/currency";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AccessRestricted } from "@/components/common";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { usePageHeader } from "@/hooks/usePageHeader";
import {
  useGetWalletQuery,
  useGetTransactionsQuery,
} from "../api/walletApi";
import {
  WalletBalanceCard,
  WalletQuickPayments,
  WalletTransactionsList,
  AddMoneyModal,
  SendMoneyModal,
  SetupPinModal,
  PayDuesModal,
  UpiPaymentModal,
  AllTransactionsModal,
} from "../components";

export const WalletPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission("wallet");

  usePageHeader({
    title: "Resident Wallet & Dues",
    description: "Manage your digital wallet, payment methods, assessment dues, and transaction statements.",
  });

  const { account, profile } = useAuth();
  const { data: wallet, isLoading: isWalletLoading, refetch: refetchWallet } = useGetWalletQuery(undefined, {
    skip: !canView,
  });
  const { data: transactions = [], isLoading: isTxLoading, refetch: refetchTx } = useGetTransactionsQuery(undefined, {
    skip: !canView,
  });

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showSetupPin, setShowSetupPin] = useState(false);
  const [showPayDues, setShowPayDues] = useState(false);
  const [showUpiMock, setShowUpiMock] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const currencySymbol = getCurrencySymbol(account?.association_country || profile?.country);
  const totalDue = parseFloat(String(account?.assessment_total_due || 0));
  const hasPaidThisMonth = Boolean(account?.assessment_paid_this_month);

  const refreshAll = () => {
    refetchWallet();
    refetchTx();
  };

  if (isPermLoading || isWalletLoading || isTxLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading wallet details..." />
      </div>
    );
  }

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="wallet" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Balance Card */}
      <WalletBalanceCard
        wallet={wallet}
        currencySymbol={currencySymbol}
        onAddMoney={() => setShowAddMoney(true)}
        onSendMoney={() => {
          if (!wallet?.has_pin) {
            setShowSetupPin(true);
          } else {
            setShowSendMoney(true);
          }
        }}
      />

      {/* Security PIN Warning Banner */}
      {!wallet?.has_pin && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-amber-950 text-sm">Secure Your Wallet PIN</h4>
              <p className="text-xs text-amber-800/80 mt-0.5 max-w-xl">
                You haven't set up a security PIN. A 4-digit PIN is required to authorize money transfers and instant payments.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={() => setShowSetupPin(true)}
            className="self-start sm:self-center"
          >
            Set Up PIN Now
          </Button>
        </div>
      )}

      {/* Quick Payments */}
      <WalletQuickPayments
        hasPaidThisMonth={hasPaidThisMonth}
        totalDue={totalDue}
        onPayMaintenance={() => setShowPayDues(true)}
      />

      {/* Recent Transactions List */}
      <WalletTransactionsList
        transactions={transactions}
        currencySymbol={currencySymbol}
        onViewAll={() => setShowAllTransactions(true)}
      />

      {/* Modals */}
      <AddMoneyModal
        isOpen={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        wallet={wallet}
        currencySymbol={currencySymbol}
        onSuccess={refreshAll}
      />

      <SendMoneyModal
        isOpen={showSendMoney}
        onClose={() => setShowSendMoney(false)}
        wallet={wallet}
        currencySymbol={currencySymbol}
        onSuccess={refreshAll}
      />

      <SetupPinModal
        isOpen={showSetupPin}
        onClose={() => setShowSetupPin(false)}
        onSuccess={refreshAll}
      />

      <PayDuesModal
        isOpen={showPayDues}
        onClose={() => setShowPayDues(false)}
        wallet={wallet}
        totalDue={totalDue}
        currencySymbol={currencySymbol}
        onSwitchToUpi={() => {
          setShowPayDues(false);
          setShowUpiMock(true);
        }}
        onSuccess={refreshAll}
      />

      <UpiPaymentModal
        isOpen={showUpiMock}
        onClose={() => setShowUpiMock(false)}
        totalDue={totalDue}
        currencySymbol={currencySymbol}
        onSuccess={refreshAll}
      />

      <AllTransactionsModal
        isOpen={showAllTransactions}
        onClose={() => setShowAllTransactions(false)}
        transactions={transactions}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};

export default WalletPage;
