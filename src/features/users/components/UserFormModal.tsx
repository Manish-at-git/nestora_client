import React, { useState, useEffect, useMemo } from "react";
import { UserPlus, Pencil, Shield, Check, Copy } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCreateUserMutation,
  useGetUserAssociationBlocksQuery,
  useGetUserBlockUnitsQuery,
  useUpdateUserMutation,
} from "../api/usersApi";
import { useGetAssociationsQuery } from "@/features/associations/api";
import { useGetRolesQuery } from "@/features/roles/api";
import { isResidentVisitorRole } from "@/constants/roleCodes";
import type { SystemUser, AdminCreateUserPayload } from "../types";

const isValidMobileNumber = (value: string) => /^\d{10}$/.test(value);

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: SystemUser | null;
  onSuccess?: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(userToEdit);

  // Form State
  const [formData, setFormData] = useState<AdminCreateUserPayload>({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    role_id: "",
    association_id: "",
  });

  const [editRoleName, setEditRoleName] = useState("");
  const [blockId, setBlockId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries & Mutations
  const { data: associations = [], isLoading: isLoadingAssocs } =
    useGetAssociationsQuery(undefined, { skip: !isOpen });
  const { data: roles = [], isLoading: isLoadingRoles } = useGetRolesQuery(
    undefined,
    { skip: !isOpen }
  );

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isSaving = isCreating || isUpdating;

  const EXCLUDED_USER_ROLE_NAMES = [
    "super admin",
    "admin",
    "accountant",
    "csr",
  ];
  const communityRoles = roles.filter(
    (r) =>
      Boolean(r.is_active) &&
      !EXCLUDED_USER_ROLE_NAMES.includes((r.name || "").toLowerCase().trim())
  );

  const selectedRole = useMemo(
    () =>
      isEditing
        ? (roles.find((role) => role.name === editRoleName) ??
          roles.find((role) => role.code === userToEdit?.role_code))
        : roles.find((role) => role.id === formData.role_id),
    [editRoleName, formData.role_id, isEditing, roles, userToEdit?.role_code]
  );
  const requiresResidence = isResidentVisitorRole(selectedRole?.code);

  const { data: blocks = [], isLoading: isLoadingBlocks } =
    useGetUserAssociationBlocksQuery(formData.association_id, {
      skip: !isOpen || !requiresResidence || !formData.association_id,
    });
  const { data: units = [], isLoading: isLoadingUnits } =
    useGetUserBlockUnitsQuery(blockId, {
      skip: !isOpen || !requiresResidence || !blockId,
    });

  const associationOptions = useMemo(() => {
    const currentAssociation =
      isEditing && userToEdit?.association_id && userToEdit.association_name
        ? {
            value: userToEdit.association_id,
            label: userToEdit.association_name,
          }
        : null;
    const fetchedAssociations = associations.map((assoc) => ({
      value: assoc.id,
      label: `${assoc.name}${assoc.city ? ` (${assoc.city})` : ""}`,
    }));

    return [
      { value: "", label: "Select an association..." },
      ...(currentAssociation &&
      !fetchedAssociations.some(
        (association) => association.value === currentAssociation.value
      )
        ? [currentAssociation]
        : []),
      ...fetchedAssociations,
    ];
  }, [associations, isEditing, userToEdit]);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          first_name: userToEdit.first_name || "",
          last_name: userToEdit.last_name || "",
          email: userToEdit.email || "",
          contact_number: userToEdit.contact_number || "",
          role_id: "",
          association_id: userToEdit.association_id || "",
        });
        setEditRoleName(userToEdit.role_name || "Homeowner");
        setBlockId(userToEdit.block_id || "");
        setUnitId(userToEdit.unit_id || "");
        setCreatedCode(null);
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          contact_number: "",
          role_id: "",
          association_id: "",
        });
        setEditRoleName("Homeowner");
        setBlockId("");
        setUnitId("");
        setCreatedCode(null);
      }
      setErrors({});
    }
  }, [userToEdit, isOpen]);

  useEffect(() => {
    if (
      !isEditing ||
      !requiresResidence ||
      blockId ||
      !userToEdit?.block_name ||
      userToEdit.association_id !== formData.association_id
    ) {
      return;
    }

    const matchingBlock = blocks.find(
      (block) => block.name === userToEdit.block_name
    );
    if (matchingBlock) {
      setBlockId(matchingBlock.id);
    }
  }, [
    blockId,
    blocks,
    formData.association_id,
    isEditing,
    requiresResidence,
    userToEdit?.association_id,
    userToEdit?.block_name,
  ]);

  useEffect(() => {
    if (
      !isEditing ||
      !requiresResidence ||
      unitId ||
      !userToEdit?.unit_number ||
      userToEdit.association_id !== formData.association_id
    ) {
      return;
    }

    const matchingUnit = units.find(
      (unit) => unit.unit_number === userToEdit.unit_number
    );
    if (matchingUnit) {
      setUnitId(matchingUnit.id);
    }
  }, [
    formData.association_id,
    isEditing,
    requiresResidence,
    unitId,
    units,
    userToEdit?.association_id,
    userToEdit?.unit_number,
  ]);

  const blockOptions = useMemo(() => {
    const currentBlock =
      isEditing && blockId && userToEdit?.block_name
        ? { value: blockId, label: userToEdit.block_name }
        : null;
    const fetchedBlocks = blocks.map((block) => ({
      value: block.id,
      label: block.name,
    }));

    return [
      { value: "", label: "Select a block..." },
      ...(currentBlock &&
      !fetchedBlocks.some((block) => block.value === currentBlock.value)
        ? [currentBlock]
        : []),
      ...fetchedBlocks,
    ];
  }, [blockId, blocks, isEditing, userToEdit?.block_name]);

  const unitOptions = useMemo(() => {
    const currentUnit =
      isEditing && unitId && userToEdit?.unit_number
        ? { value: unitId, label: userToEdit.unit_number }
        : null;
    const fetchedUnits = units.map((unit) => ({
      value: unit.id,
      label: unit.unit_number,
    }));

    return [
      { value: "", label: "Select a unit..." },
      ...(currentUnit &&
      !fetchedUnits.some((unit) => unit.value === currentUnit.value)
        ? [currentUnit]
        : []),
      ...fetchedUnits,
    ];
  }, [isEditing, unitId, units, userToEdit?.unit_number]);

  const handleFieldChange = (
    field: keyof AdminCreateUserPayload,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAssociationChange = (associationId: string) => {
    handleFieldChange("association_id", associationId);
    setBlockId("");
    setUnitId("");
  };

  const handleBlockChange = (nextBlockId: string) => {
    setBlockId(nextBlockId);
    setUnitId("");
    if (errors.block_id || errors.unit_id) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next.block_id;
        delete next.unit_id;
        return next;
      });
    }
  };

  const handleUnitChange = (nextUnitId: string) => {
    setUnitId(nextUnitId);
    if (errors.unit_id) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next.unit_id;
        return next;
      });
    }
  };

  const validate = () => {
    if (!isEditing) {
      if (!formData.first_name.trim()) {
        setErrors({ first_name: "First name is required" });
        return false;
      }
      if (!formData.last_name.trim()) {
        setErrors({ last_name: "Last name is required" });
        return false;
      }
      if (!formData.email.trim()) {
        setErrors({ email: "Email address is required" });
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrors({ email: "Please enter a valid email address" });
        return false;
      }
      if (!formData.contact_number.trim()) {
        setErrors({ contact_number: "Contact number is required" });
        return false;
      }
      if (!isValidMobileNumber(formData.contact_number)) {
        setErrors({
          contact_number: "Enter a valid 10-digit mobile number",
        });
        return false;
      }
      if (!formData.role_id) {
        setErrors({ role_id: "Please select a role" });
        return false;
      }
      if (!formData.association_id) {
        setErrors({ association_id: "Please select an association" });
        return false;
      }
      if (requiresResidence && !blockId) {
        setErrors({ block_id: "Please select a block" });
        return false;
      }
      if (requiresResidence && !unitId) {
        setErrors({ unit_id: "Please select a unit" });
        return false;
      }
    } else {
      if (!formData.email.trim()) {
        setErrors({ email: "Email address is required" });
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrors({ email: "Please enter a valid email address" });
        return false;
      }
      if (!formData.contact_number.trim()) {
        setErrors({ contact_number: "Contact number is required" });
        return false;
      }
      if (!isValidMobileNumber(formData.contact_number)) {
        setErrors({
          contact_number: "Enter a valid 10-digit mobile number",
        });
        return false;
      }
      if (!editRoleName) {
        setErrors({ role_name: "Please select a role" });
        return false;
      }
      if (requiresResidence && !blockId) {
        setErrors({ block_id: "Please select a block" });
        return false;
      }
      if (requiresResidence && !unitId) {
        setErrors({ unit_id: "Please select a unit" });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleCopyCreatedCode = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(createdCode);
    setCopiedCode(true);
    toast.success("Activation code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (!isEditing) {
        const res = await createUser({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim().toLowerCase(),
          contact_number: formData.contact_number.trim(),
          role_id: formData.role_id,
          association_id: formData.association_id,
          unit_id: requiresResidence ? unitId : undefined,
        }).unwrap();

        if (res.activation_code) {
          setCreatedCode(res.activation_code);
          toast.success("User account registered with activation code!");
        } else {
          toast.success("User created successfully!");
          onSuccess?.();
          onClose();
        }
      } else {
        if (!userToEdit) return;

        await updateUser({
          userId: userToEdit.user_id,
          data: {
            email: formData.email.trim().toLowerCase(),
            contact_number: formData.contact_number.trim(),
            role_name: editRoleName,
            association_id: formData.association_id || undefined,
            unit_id: requiresResidence ? unitId : undefined,
          },
        }).unwrap();

        toast.success("User updated successfully!");
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.data || err?.message || "Failed to save user"
      );
    }
  };

  if (createdCode) {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={() => {
          onSuccess?.();
          onClose();
        }}
        title="User Created Successfully"
        icon={<Shield size={18} className="text-emerald-600" />}
        size="md"
        submitText="Done"
        showCancel={false}
        onSubmit={() => {
          onSuccess?.();
          onClose();
        }}
      >
        <div className="space-y-4 py-2">
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-center space-y-2">
            <div className="inline-flex p-2 bg-emerald-100 text-emerald-700 rounded-full">
              <Shield size={22} />
            </div>
            <h4 className="text-sm font-bold text-emerald-900">
              User Successfully Registered!
            </h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Share this secure activation code with the user to allow them to
              activate their account.
            </p>
            <div className="mt-3 p-3 bg-white border border-emerald-300 rounded-xl flex items-center justify-between">
              <span className="text-lg font-mono font-bold tracking-widest text-emerald-900">
                {createdCode}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyCreatedCode}
                className="h-8 gap-1.5 border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </Button>
            </div>
          </div>
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User" : "Add User"}
      description={
        isEditing
          ? "Update resident or community member account details."
          : "Register homeowners, tenants, and board members with association access."
      }
      icon={
        isEditing ? (
          <Pencil size={18} className="text-slate-800" />
        ) : (
          <UserPlus size={18} className="text-slate-800" />
        )
      }
      size="xl"
      isSubmitting={isSaving}
      submitText={isEditing ? "Save Changes" : "Create User"}
      loadingText={isEditing ? "Saving Changes..." : "Creating User..."}
      submitVariant="default"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {/* First & Last Name (Add Mode only) */}
        {!isEditing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              required
              error={errors.first_name}
            >
              <Input
                type="text"
                placeholder="e.g. John"
                value={formData.first_name}
                onChange={(e) =>
                  handleFieldChange("first_name", e.target.value)
                }
                disabled={isSaving}
                autoFocus
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={errors.last_name}
            >
              <Input
                type="text"
                placeholder="e.g. Doe"
                value={formData.last_name}
                onChange={(e) =>
                  handleFieldChange("last_name", e.target.value)
                }
                disabled={isSaving}
              />
            </FormField>
          </div>
        )}

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Email Address"
            required
            error={errors.email}
          >
            <Input
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              disabled={isSaving}
            />
          </FormField>

          <FormField
            label="Contact Number"
            required
            error={errors.contact_number}
          >
            <Input
              type="tel"
              placeholder="9876543210"
              value={formData.contact_number}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) =>
                handleFieldChange(
                  "contact_number",
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              disabled={isSaving}
            />
          </FormField>
        </div>

        {/* Role & Association */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="User Role"
            required
            error={isEditing ? errors.role_name : errors.role_id}
          >
            {isEditing ? (
              <Select
                value={editRoleName}
                onChange={(e) => {
                  setEditRoleName(e.target.value);
                  if (errors.role_name) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.role_name;
                      return next;
                    });
                  }
                }}
                options={[
                  { value: "", label: "Select role..." },
                  ...communityRoles.map((r) => ({
                    value: r.name,
                    label: r.name,
                  })),
                  ...(!communityRoles.some((r) => r.name === editRoleName) &&
                  editRoleName
                    ? [{ value: editRoleName, label: editRoleName }]
                    : []),
                ]}
                placeholder="Select role..."
                disabled={isSaving || isLoadingRoles}
                error={Boolean(errors.role_name)}
              />
            ) : (
              <Select
                value={formData.role_id}
                onChange={(e) => handleFieldChange("role_id", e.target.value)}
                options={[
                  { value: "", label: "Select role..." },
                  ...communityRoles.map((r) => ({
                    value: r.id,
                    label: r.name,
                  })),
                ]}
                placeholder="Select role..."
                disabled={isSaving || isLoadingRoles}
                error={Boolean(errors.role_id)}
              />
            )}
          </FormField>

          <FormField
            label="Primary Association"
            required={!isEditing}
            error={errors.association_id}
          >
            <Select
              value={formData.association_id}
              onChange={(e) => handleAssociationChange(e.target.value)}
              options={associationOptions}
              placeholder="Select an association..."
              disabled={isSaving || isLoadingAssocs}
              error={Boolean(errors.association_id)}
            />
          </FormField>
        </div>

        {requiresResidence && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <FormField label="Block" required error={errors.block_id}>
              <Select
                value={blockId}
                onChange={(e) => handleBlockChange(e.target.value)}
                options={blockOptions}
                placeholder="Select a block..."
                disabled={
                  isSaving ||
                  isLoadingBlocks ||
                  !formData.association_id
                }
                error={Boolean(errors.block_id)}
              />
            </FormField>

            <FormField label="Unit" required error={errors.unit_id}>
              <Select
                value={unitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                options={unitOptions}
                placeholder="Select a unit..."
                disabled={isSaving || isLoadingUnits || !blockId}
                error={Boolean(errors.unit_id)}
              />
            </FormField>
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default UserFormModal;
