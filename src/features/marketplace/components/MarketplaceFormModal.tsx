import React, { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Tag,
  Upload,
  Layers,
  Phone,
  MapPin,
  IndianRupee,
  CheckCircle,
} from "lucide-react";
import { FormModal, FormField } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/useAppForm";
import { uploadMediaAsset, resolveMediaUrl } from "@/lib/cloudUploader";
import {
  useGetMarketplaceCategoriesQuery,
  useCreateMarketplaceItemMutation,
  useUpdateMarketplaceItemMutation,
} from "../api/marketplaceApi";
import {
  marketplaceSchema,
  type MarketplaceFormData,
} from "../schemas/marketplaceSchema";
import type { MarketplaceItem } from "../types";

export interface MarketplaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: MarketplaceItem | null;
  onSuccess?: () => void;
}

const LISTING_TYPES = [
  { value: "Sell", label: "Sell" },
  { value: "Buy", label: "Buy / Looking For" },
  { value: "Give Away", label: "Give Away (Free)" },
  { value: "Rent", label: "Rent" },
  { value: "Exchange", label: "Exchange / Barter" },
];

const CONDITION_STATES = [
  { value: "New", label: "Brand New (Unused)" },
  { value: "Like New", label: "Like New" },
  { value: "Excellent", label: "Excellent Condition" },
  { value: "Good", label: "Good Condition" },
  { value: "Fair", label: "Fair / Used" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active (Published)" },
  { value: "Draft", label: "Save as Draft" },
  { value: "Sold", label: "Mark as Sold" },
];

export const MarketplaceFormModal: React.FC<MarketplaceFormModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}) => {
  const [createItem, { isLoading: isCreating }] =
    useCreateMarketplaceItemMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateMarketplaceItemMutation();

  const { data: categories = [] } = useGetMarketplaceCategoriesQuery();

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isSubmitting = isCreating || isUpdating;
  const isEditMode = Boolean(itemToEdit);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useAppForm<MarketplaceFormData>({
    schema: marketplaceSchema,
    defaultValues: {
      title: "",
      listing_type: "Sell",
      category_id: "",
      price: "" as any,
      condition_state: "New",
      brand: "",
      item_age: "",
      location: "",
      contact_number: "",
      is_negotiable: false,
      description: "",
      status: "Active",
      images: [],
    },
  });

  const images = watch("images") || [];

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        reset({
          title: itemToEdit.title || "",
          listing_type: itemToEdit.listing_type || "Sell",
          category_id: String(itemToEdit.category_id || ""),
          price: itemToEdit.price !== undefined ? Number(itemToEdit.price) : ("" as any),
          condition_state: itemToEdit.condition_state || "New",
          brand: itemToEdit.brand || "",
          item_age: itemToEdit.item_age || "",
          location: itemToEdit.location || "",
          contact_number: itemToEdit.contact_number || "",
          is_negotiable: Boolean(itemToEdit.is_negotiable),
          description: itemToEdit.description || "",
          status: itemToEdit.status || "Active",
          images: itemToEdit.images || [],
        });
      } else {
        reset({
          title: "",
          listing_type: "Sell",
          category_id: "",
          price: "" as any,
          condition_state: "New",
          brand: "",
          item_age: "",
          location: "",
          contact_number: "",
          is_negotiable: false,
          description: "",
          status: "Active",
          images: [],
        });
      }
    }
  }, [isOpen, itemToEdit, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadMediaAsset(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.url).filter(Boolean);
      setValue("images", [...images, ...newUrls], { shouldValidate: true });
      toast.success(`${newUrls.length} photo(s) uploaded`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo(s)");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setValue("images", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: MarketplaceFormData) => {
    try {
      const payload = {
        title: data.title.trim(),
        listing_type: data.listing_type,
        category_id: data.category_id,
        price: Number(data.price),
        condition_state: data.condition_state,
        brand: data.brand?.trim() || undefined,
        item_age: data.item_age?.trim() || undefined,
        location: data.location.trim(),
        contact_number: data.contact_number.trim(),
        is_negotiable: data.is_negotiable,
        description: data.description?.trim() || undefined,
        status: data.status,
        images: data.images || [],
      };

      if (isEditMode && itemToEdit) {
        await updateItem({
          id: itemToEdit.id,
          data: payload,
        }).unwrap();
        toast.success("Listing updated successfully");
      } else {
        await createItem(payload).unwrap();
        toast.success("Item posted to Marketplace successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err.data?.detail || err.message || "Failed to save marketplace item"
      );
    }
  };

  // Top-to-bottom error prioritization
  const fieldOrder: (keyof MarketplaceFormData)[] = [
    "title",
    "listing_type",
    "category_id",
    "price",
    "condition_state",
    "location",
    "contact_number",
    "description",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof MarketplaceFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Marketplace Listing" : "Post an Item for Sale"}
      icon={<ShoppingBag size={18} className="text-slate-800" />}
      size="xl"
      isSubmitting={isSubmitting}
      submitDisabled={uploading || isSubmitting}
      submitText={isEditMode ? "Update Listing" : "Post Item"}
      loadingText={isEditMode ? "Updating..." : "Posting Item..."}
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-5 py-1">
        {/* Photo Gallery Upload Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Item Photos
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 group shadow-xs"
              >
                <img
                  src={resolveMediaUrl(url)}
                  alt={`preview-${idx}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Plus size={20} className="mb-0.5" />
              <span className="text-[10px] font-semibold">
                {uploading ? "Uploading..." : "Add Photo"}
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Add clear photos from different angles (PNG, JPG, WebP).
          </p>
        </div>

        {/* 2-Column Grid of Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <FormField label="Listing Title" required error={getFieldError("title")}>
              <Input
                placeholder="e.g. Solid Oak Study Desk, Sony WH-1000XM4 Headphones"
                disabled={isSubmitting}
                {...register("title")}
              />
            </FormField>
          </div>

          {/* Listing Type */}
          <FormField
            label="Listing Type"
            required
            error={getFieldError("listing_type")}
          >
            <Controller
              name="listing_type"
              control={control}
              render={({ field }) => (
                <Select
                  icon={<Tag size={15} />}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={LISTING_TYPES}
                  disabled={isSubmitting}
                  size="md"
                />
              )}
            />
          </FormField>

          {/* Category */}
          <FormField label="Category" required error={getFieldError("category_id")}>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select
                  icon={<Layers size={15} />}
                  value={field.value ? String(field.value) : ""}
                  onValueChange={field.onChange}
                  options={categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  placeholder={
                    categories.length === 0
                      ? "Loading categories..."
                      : "Select Category"
                  }
                  disabled={isSubmitting || categories.length === 0}
                  error={Boolean(getFieldError("category_id"))}
                  size="md"
                />
              )}
            />
          </FormField>

          {/* Price */}
          <FormField label="Price (₹)" required error={getFieldError("price")}>
            <div className="relative">
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 4500"
                disabled={isSubmitting}
                {...register("price")}
              />
            </div>
          </FormField>

          {/* Condition */}
          <FormField
            label="Item Condition"
            required
            error={getFieldError("condition_state")}
          >
            <Controller
              name="condition_state"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  options={CONDITION_STATES}
                  disabled={isSubmitting}
                  size="md"
                />
              )}
            />
          </FormField>

          {/* Brand */}
          <FormField label="Brand / Manufacturer" error={getFieldError("brand")}>
            <Input
              placeholder="e.g. IKEA, Apple, Sony, Nilkamal"
              disabled={isSubmitting}
              {...register("brand")}
            />
          </FormField>

          {/* Item Age */}
          <FormField label="Age of Item" error={getFieldError("item_age")}>
            <Input
              placeholder="e.g. 6 months, 2 years"
              disabled={isSubmitting}
              {...register("item_age")}
            />
          </FormField>

          {/* Location */}
          <FormField
            label="Location (Tower / Block / Unit)"
            required
            error={getFieldError("location")}
          >
            <div className="relative">
              <Input
                placeholder="e.g. Tower B - 402"
                disabled={isSubmitting}
                {...register("location")}
              />
            </div>
          </FormField>

          {/* Contact Number */}
          <FormField
            label="Contact Phone Number"
            required
            error={getFieldError("contact_number")}
          >
            <Input
              placeholder="e.g. +91 9876543210"
              disabled={isSubmitting}
              {...register("contact_number")}
            />
          </FormField>
        </div>

        {/* Negotiable Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <Controller
            name="is_negotiable"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
                <span>Price is Negotiable</span>
              </label>
            )}
          />
        </div>

        {/* Description */}
        <FormField label="Detailed Description" error={getFieldError("description")}>
          <Textarea
            placeholder="Provide details about the item's condition, dimensions, accessories included, or reason for selling..."
            disabled={isSubmitting}
            rows={3}
            {...register("description")}
          />
        </FormField>

        {/* Status Option */}
        <div className="w-full sm:w-1/2">
          <FormField label="Listing Status" error={getFieldError("status")}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  options={STATUS_OPTIONS}
                  disabled={isSubmitting}
                  size="md"
                />
              )}
            />
          </FormField>
        </div>
      </div>
    </FormModal>
  );
};

export default MarketplaceFormModal;
