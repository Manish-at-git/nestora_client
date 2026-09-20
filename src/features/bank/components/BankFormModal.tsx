import React, { useState, useEffect } from "react";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormField } from "@/components/common/FormField";
import { toast } from "sonner";
import {
  Landmark,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Zap,
  QrCode,
} from "lucide-react";
import {
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
} from "../api/bankApi";
import { useGetAssociationsQuery } from "@/features/associations/api";
import type { BankAccount, BankAccountCreatePayload } from "../types";

export interface BankFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: BankAccount | null;
  onSuccess?: () => void;
}

export const BankFormModal: React.FC<BankFormModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(accountToEdit);
  const [activeTab, setActiveTab] = useState<string>("banking");

  // Form states
  const [associationId, setAssociationId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountType, setAccountType] = useState("Current");
  const [currency, setCurrency] = useState("INR");

  const [gatewayProvider, setGatewayProvider] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const [isDefault, setIsDefault] = useState(false);
  const [status, setStatus] = useState("Active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: associations = [] } = useGetAssociationsQuery();
  const [createAccount, { isLoading: isCreating }] = useCreateBankAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateBankAccountMutation();

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (accountToEdit) {
        setAssociationId(accountToEdit.association_id || "");
        setAccountName(accountToEdit.account_name || "");
        setAccountHolderName(accountToEdit.account_holder_name || "");
        setBankName(accountToEdit.bank_name || "");
        setAccountNumber(accountToEdit.account_number || "");
        setIfscCode(accountToEdit.ifsc_code || "");
        setBranchName(accountToEdit.branch_name || "");
        setAccountType(accountToEdit.account_type || "Current");
        setCurrency(accountToEdit.currency || "INR");

        setGatewayProvider(accountToEdit.gateway_provider || "");
        setMerchantId(accountToEdit.merchant_id || "");
        setApiKey(accountToEdit.api_key || "");
        setApiSecret(accountToEdit.api_secret || "");
        setWebhookSecret(accountToEdit.webhook_secret || "");
        setUpiId(accountToEdit.upi_id || "");
        setQrCodeUrl(accountToEdit.qr_code_url || "");

        setIsDefault(Boolean(accountToEdit.is_default));
        setStatus(accountToEdit.status || "Active");
      } else {
        setAssociationId("");
        setAccountName("");
        setAccountHolderName("");
        setBankName("");
        setAccountNumber("");
        setIfscCode("");
        setBranchName("");
        setAccountType("Current");
        setCurrency("INR");

        setGatewayProvider("");
        setMerchantId("");
        setApiKey("");
        setApiSecret("");
        setWebhookSecret("");
        setUpiId("");
        setQrCodeUrl("");

        setIsDefault(false);
        setStatus("Active");
      }
      setActiveTab("banking");
    }
  }, [accountToEdit, isOpen]);

  const validateBankingTab = () => {
    if (!associationId) {
      setErrors({ associationId: "Please select an association" });
      setActiveTab("banking");
      return false;
    }
    if (!bankName.trim()) {
      setErrors({ bankName: "Bank name is required" });
      setActiveTab("banking");
      return false;
    }
    if (!accountName.trim()) {
      setErrors({ accountName: "Account display label is required" });
      setActiveTab("banking");
      return false;
    }
    if (!accountHolderName.trim()) {
      setErrors({ accountHolderName: "Account beneficiary name is required" });
      setActiveTab("banking");
      return false;
    }
    if (!accountNumber.trim()) {
      setErrors({ accountNumber: "Account number is required" });
      setActiveTab("banking");
      return false;
    }
    if (!ifscCode.trim()) {
      setErrors({ ifscCode: "IFSC code is required" });
      setActiveTab("banking");
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!validateBankingTab()) return;
    setActiveTab("gateway");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBankingTab()) return;

    // If still on the first tab, advance to next tab
    if (activeTab === "banking") {
      setActiveTab("gateway");
      return;
    }

    const payload: BankAccountCreatePayload = {
      association_id: associationId,
      account_name: accountName.trim(),
      account_holder_name: accountHolderName.trim(),
      bank_name: bankName.trim(),
      account_number: accountNumber.trim(),
      ifsc_code: ifscCode.trim().toUpperCase(),
      branch_name: branchName.trim() || undefined,
      account_type: accountType,
      currency: currency || "INR",

      gateway_provider: gatewayProvider || undefined,
      merchant_id: merchantId.trim() || undefined,
      api_key: apiKey.trim() || undefined,
      api_secret: apiSecret.trim() || undefined,
      webhook_secret: webhookSecret.trim() || undefined,
      upi_id: upiId.trim() || undefined,
      qr_code_url: qrCodeUrl.trim() || undefined,

      is_default: isDefault,
      status: status || "Active",
    };

    try {
      if (isEditing && accountToEdit) {
        await updateAccount({ accountId: accountToEdit.id, data: payload }).unwrap();
        toast.success("Bank account updated successfully!");
      } else {
        await createAccount(payload).unwrap();
        toast.success("Bank account registered successfully!");
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data || err?.message || "Failed to save bank account");
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Bank Account" : "Add Bank Account"}
      description={
        isEditing
          ? "Update bank settlement credentials and payment gateway integration."
          : "Connect an association operating account for collections and payouts."
      }
      icon={isEditing ? <Pencil size={20} /> : <Landmark size={20} />}
      size="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {activeTab === "gateway" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("banking")}
                disabled={isSaving}
                className="rounded-xl border-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Banking Details</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-xl border-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "gateway" && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-xl border-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </Button>
            )}

            {activeTab === "banking" ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: Payment Gateway</span>
                <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
              >
                {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Save Account"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100/80 p-1 rounded-xl">
            <TabsTrigger value="banking" className="rounded-lg text-xs font-semibold py-2 cursor-pointer">
              Banking Details
            </TabsTrigger>
            <TabsTrigger value="gateway" className="rounded-lg text-xs font-semibold py-2 cursor-pointer">
              Payment Gateway & UPI (Optional)
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Banking Details */}
          <TabsContent value="banking" className="space-y-4 mt-0">
            <FormField label="Assigned Association" required error={errors.associationId}>
              <Select
                value={associationId}
                onChange={(e) => {
                  setAssociationId(e.target.value);
                  if (errors.associationId) {
                    setErrors((prev) => ({ ...prev, associationId: "" }));
                  }
                }}
                options={[
                  { value: "", label: "Select association..." },
                  ...associations.map((assoc) => ({
                    value: assoc.id,
                    label: `${assoc.name}${assoc.city ? ` (${assoc.city})` : ""}`,
                  })),
                ]}
                placeholder="Select association..."
                disabled={isSaving}
                error={Boolean(errors.associationId)}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Bank Name" required error={errors.bankName}>
                <Input
                  type="text"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    if (errors.bankName) {
                      setErrors((prev) => ({ ...prev, bankName: "" }));
                    }
                  }}
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  disabled={isSaving}
                  error={Boolean(errors.bankName)}
                />
              </FormField>

              <FormField label="Account Display Label" required error={errors.accountName}>
                <Input
                  type="text"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value);
                    if (errors.accountName) {
                      setErrors((prev) => ({ ...prev, accountName: "" }));
                    }
                  }}
                  placeholder="e.g. Maintenance Operating Account"
                  disabled={isSaving}
                  error={Boolean(errors.accountName)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Account Beneficiary / Holder Name" required error={errors.accountHolderName}>
                <Input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => {
                    setAccountHolderName(e.target.value);
                    if (errors.accountHolderName) {
                      setErrors((prev) => ({ ...prev, accountHolderName: "" }));
                    }
                  }}
                  placeholder="e.g. Palm Meadows Owners Association"
                  disabled={isSaving}
                  error={Boolean(errors.accountHolderName)}
                />
              </FormField>

              <FormField label="Account Number" required error={errors.accountNumber}>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value.replace(/\D/g, ""));
                    if (errors.accountNumber) {
                      setErrors((prev) => ({ ...prev, accountNumber: "" }));
                    }
                  }}
                  placeholder="e.g. 50200012345678"
                  className="font-mono"
                  disabled={isSaving}
                  error={Boolean(errors.accountNumber)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="IFSC Code" required error={errors.ifscCode}>
                <Input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => {
                    setIfscCode(e.target.value.toUpperCase());
                    if (errors.ifscCode) {
                      setErrors((prev) => ({ ...prev, ifscCode: "" }));
                    }
                  }}
                  placeholder="HDFC0001234"
                  className="font-mono uppercase"
                  disabled={isSaving}
                  error={Boolean(errors.ifscCode)}
                />
              </FormField>

              <FormField label="Branch Name">
                <Input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Whitefield"
                  disabled={isSaving}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Account Type">
                <Select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  options={[
                    { value: "Current", label: "Current Account" },
                    { value: "Savings", label: "Savings Account" },
                    { value: "Escrow", label: "Escrow Account" },
                    { value: "Fixed Deposit", label: "Fixed Deposit" },
                  ]}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Currency">
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { value: "INR", label: "INR (₹) - Indian Rupee" },
                    { value: "USD", label: "USD ($) - US Dollar" },
                    { value: "GBP", label: "GBP (£) - British Pound" },
                    { value: "AED", label: "AED - UAE Dirham" },
                    { value: "CAD", label: "CAD ($) - Canadian Dollar" },
                    { value: "EUR", label: "EUR (€) - Euro" },
                    { value: "SGD", label: "SGD ($) - Singapore Dollar" },
                    { value: "AUD", label: "AUD ($) - Australian Dollar" },
                  ]}
                  disabled={isSaving}
                />
              </FormField>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50/75 rounded-xl border border-slate-200/60">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                <Checkbox
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(Boolean(checked))}
                  disabled={isSaving}
                />
                <span>Set as Primary Operating Account</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <Select
                  size="sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    { value: "Suspended", label: "Suspended" },
                  ]}
                  disabled={isSaving}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gateway" className="space-y-5 mt-0">
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                <QrCode size={14} className="text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  UPI & Instant Payment Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="UPI ID / VPA Handle"
                  helperText="Virtual Payment Address for direct QR & UPI collections"
                >
                  <Input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. association@hdfcbank"
                    className="font-mono"
                    disabled={isSaving}
                  />
                </FormField>

                <FormField
                  label="UPI QR Code URL / Image Link"
                  helperText="Direct image URL for printed or static QR code"
                >
                  <Input
                    type="text"
                    value={qrCodeUrl}
                    onChange={(e) => setQrCodeUrl(e.target.value)}
                    placeholder="e.g. https://storage.example.com/qr/association.png"
                    disabled={isSaving}
                  />
                </FormField>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                <Zap size={14} className="text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Payment Gateway Integration
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Payment Gateway Provider">
                  <Select
                    value={gatewayProvider}
                    onChange={(e) => setGatewayProvider(e.target.value)}
                    options={[
                      { value: "", label: "None / Manual Bank Transfer" },
                      { value: "Razorpay", label: "Razorpay" },
                      { value: "Cashfree", label: "Cashfree Payments" },
                      { value: "PayU", label: "PayU" },
                      { value: "Stripe", label: "Stripe" },
                    ]}
                    disabled={isSaving}
                  />
                </FormField>

                <FormField label="Merchant / Account ID">
                  <Input
                    type="text"
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    placeholder="e.g. acc_xxxxxxxx"
                    className="font-mono"
                    disabled={isSaving}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="API Key / Key ID">
                  <Input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="e.g. rzp_live_xxxxxxxx"
                    className="font-mono"
                    disabled={isSaving}
                  />
                </FormField>

                <FormField label="API Secret / Key Secret">
                  <Input
                    type="text"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="e.g. secret_key_xxxxxxxx"
                    className="font-mono"
                    disabled={isSaving}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Webhook Secret">
                  <Input
                    type="text"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder="e.g. whsec_xxxxxxxx"
                    className="font-mono"
                    disabled={isSaving}
                  />
                </FormField>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </ModalWrapper>
  );
};

export default BankFormModal;
