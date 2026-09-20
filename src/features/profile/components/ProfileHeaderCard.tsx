import React, { useState } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadMediaAsset, resolveMediaUrl } from "@/lib/cloudUploader";
import { getTwoLetterInitials } from "@/utils/commonFunctions";
import { isSuperAdmin } from "@/lib/utils";
import { useUpdateUserDetailsMutation } from "../api/profileApi";
import { UserDetails } from "../types";

export interface ProfileHeaderCardProps {
  userDetails?: UserDetails;
  associationName?: string;
  email?: string;
  role?: string;
  roleCode?: string;
  onRefresh?: () => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  userDetails = {},
  associationName = "Nestora",
  email = "user@nestora.io",
  role,
  roleCode,
  onRefresh,
}) => {
  const [updateUserDetails] = useUpdateUserDetailsMutation();
  const [isUploading, setIsUploading] = useState(false);
  const isSuper = isSuperAdmin(roleCode);

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset file input so re-uploading the same file works
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WEBP, etc.)");
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      toast.info("Uploading profile picture...");
      const res = await uploadMediaAsset(file);
      if (res && res.ok && res.url) {
        await updateUserDetails({ profile_pic_url: res.url }).unwrap();
        toast.success("Profile picture updated successfully!");
        onRefresh?.();
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.data?.detail ||
        err?.message ||
        "Error updating profile picture";
      toast.error(typeof errorMsg === "string" ? errorMsg : "Error updating profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveProfilePic = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

    try {
      setIsUploading(true);
      await updateUserDetails({ profile_pic_url: "" }).unwrap();
      toast.success("Profile picture removed successfully");
      onRefresh?.();
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.data?.detail ||
        err?.message ||
        "Error removing profile picture";
      toast.error(typeof errorMsg === "string" ? errorMsg : "Error removing profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const displayName = isSuper ? "Nestora Platform" : associationName;
  const associationInitials = getTwoLetterInitials(displayName);

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-sm flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#232C3E] border border-slate-700/60 shadow-md"
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-display text-xl sm:text-2xl font-bold shrink-0 select-none bg-amber-500/20 text-amber-400 border border-amber-400/30"
        >
          {associationInitials}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
              {displayName}
            </h1>
            {isSuper && (
              <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-md tracking-wider uppercase">
                Root Admin
              </span>
            )}
          </div>
          <p className={`${isSuper ? "text-slate-300" : "text-emerald-100"} opacity-80 uppercase tracking-widest text-xs mt-1`}>
            {isSuper ? "Global Platform Administration" : (role ? `${role} Profile` : "Association Member")}
          </p>
        </div>
      </div>

      <div className="relative group flex items-center justify-center">
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            id="profilePicUpload"
            disabled={isUploading}
            onChange={handleProfilePicUpload}
          />
          <label
            htmlFor="profilePicUpload"
            className={`cursor-pointer block relative rounded-full ring-2 ring-white/20 hover:ring-white/40 transition-all ${
              isUploading ? "pointer-events-none opacity-80" : ""
            }`}
            title="Click to change profile picture"
          >
            {userDetails.profile_pic_url ? (
              <img
                src={resolveMediaUrl(userDetails.profile_pic_url)}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-700 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#232C3E] text-white flex items-center justify-center font-display text-xl sm:text-2xl font-semibold shadow-md border-2 border-slate-600 select-none">
                {(userDetails.name || email || "U").charAt(0).toUpperCase()}
              </div>
            )}

            {isUploading ? (
              <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center z-10">
                <Loader2 size={22} className="text-white animate-spin" />
                <span className="text-[9px] text-white font-medium mt-1">Saving</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/45 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity z-10">
                <Camera size={18} className="text-white" />
                <span className="text-[9px] text-white font-medium mt-0.5">Edit</span>
              </div>
            )}
          </label>
        </div>

        {userDetails.profile_pic_url && !isUploading && (
          <button
            type="button"
            onClick={handleRemoveProfilePic}
            className="absolute -bottom-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition-all hover:scale-110 cursor-pointer z-20 border border-white/30"
            title="Remove Photo"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeaderCard;
