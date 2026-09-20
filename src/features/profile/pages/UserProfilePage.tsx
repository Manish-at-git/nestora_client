import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner, DeleteModal } from "@/components/common";
import { usePageHeader } from "@/hooks/usePageHeader";
import {
  useGetProfileDataQuery,
  useDeleteVehicleMutation,
  useDeletePetMutation,
  useDeleteEducationMutation,
  useDeleteExperienceMutation,
} from "../api/profileApi";
import {
  ProfileHeaderCard,
  ProfileDetailsCard,
  VehicleListSection,
  VehicleFormModal,
  PetListSection,
  PetFormModal,
  EducationListSection,
  EducationFormModal,
  ExperienceListSection,
  ExperienceFormModal,
  SuperAdminOverviewCard,
  SuperAdminSecurityCard,
} from "../components";
import { isSuperAdmin } from "@/lib/utils";
import {
  Vehicle,
  VehicleFormData,
  Pet,
  PetFormData,
  Education,
  EducationFormData,
  Experience,
  ExperienceFormData,
} from "../types";
import { ROLES_STRING } from "@/lib/staticData";

export const UserProfilePage: React.FC = () => {
  const { account, profile } = useAuth();

  const roleCode = (account?.role_code || "").trim().toLowerCase();
  const isSuper = isSuperAdmin(roleCode);
  const isEmployee = [ROLES_STRING.ADMIN, ROLES_STRING.ACCOUNTANT, ROLES_STRING.CSR, ROLES_STRING.SECURITY].includes(roleCode);
  const isHomeownerGroup = [ROLES_STRING.HOMEOWNER, ROLES_STRING.BOARD_MEMBER, ROLES_STRING.COMMITTEE_MEMBER, ROLES_STRING.TENANT].includes(roleCode);

  usePageHeader({
    title: isSuper ? "Super Administrator Profile" : "My Profile",
    description: isSuper
      ? "Platform governance, root credentials, and system administration."
      : "Manage your personal details, household, and vehicle information.",
  });

  const { data: profileData, isLoading, refetch } = useGetProfileDataQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteVehicle, { isLoading: isDeletingVehicle }] = useDeleteVehicleMutation();
  const [deletePet, { isLoading: isDeletingPet }] = useDeletePetMutation();
  const [deleteEducation, { isLoading: isDeletingEducation }] = useDeleteEducationMutation();
  const [deleteExperience, { isLoading: isDeletingExperience }] = useDeleteExperienceMutation();

  // Modals state
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleFormData | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const [showPetModal, setShowPetModal] = useState(false);
  const [editingPet, setEditingPet] = useState<PetFormData | null>(null);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

  const [showEduModal, setShowEduModal] = useState(false);
  const [editingEdu, setEditingEdu] = useState<EducationFormData | null>(null);
  const [educationToDelete, setEducationToDelete] = useState<Education | null>(null);

  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceFormData | null>(null);
  const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);

  const associationName = isSuper
    ? "Nestora Platform"
    : isHomeownerGroup
    ? profileData?.association_name ||
      profileData?.user_details?.association_name ||
      account?.association_name ||
      "Nestora HOA"
    : "Nestora";

  // Vehicle handlers
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteVehicle(vehicleToDelete.id).unwrap();
      toast.success(
        `Vehicle "${vehicleToDelete.registration_number || "Vehicle"}" deleted successfully`
      );
      setVehicleToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || "Error deleting vehicle");
    }
  };

  // Pet handlers
  const handleAddPet = () => {
    setEditingPet(null);
    setShowPetModal(true);
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setShowPetModal(true);
  };

  const handleDeletePet = (pet: Pet) => {
    setPetToDelete(pet);
  };

  const handleConfirmDeletePet = async () => {
    if (!petToDelete) return;
    try {
      await deletePet(petToDelete.id).unwrap();
      toast.success(`Pet "${petToDelete.name || "Pet"}" deleted successfully`);
      setPetToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || "Error deleting pet");
    }
  };

  // Education handlers
  const handleAddEducation = () => {
    setEditingEdu(null);
    setShowEduModal(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEditingEdu(edu);
    setShowEduModal(true);
  };

  const handleDeleteEducation = (edu: Education) => {
    setEducationToDelete(edu);
  };

  const handleConfirmDeleteEducation = async () => {
    if (!educationToDelete) return;
    try {
      await deleteEducation(educationToDelete.id).unwrap();
      toast.success(
        `Education record "${educationToDelete.degree || educationToDelete.institution || "Record"}" deleted successfully`
      );
      setEducationToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || "Error deleting education record");
    }
  };

  // Experience handlers
  const handleAddExperience = () => {
    setEditingExp(null);
    setShowExpModal(true);
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingExp(exp);
    setShowExpModal(true);
  };

  const handleDeleteExperience = (exp: Experience) => {
    setExperienceToDelete(exp);
  };

  const handleConfirmDeleteExperience = async () => {
    if (!experienceToDelete) return;
    try {
      await deleteExperience(experienceToDelete.id).unwrap();
      toast.success(
        `Experience record "${experienceToDelete.job_title || experienceToDelete.company || "Record"}" deleted successfully`
      );
      setExperienceToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || "Error deleting experience record");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading profile details..." />
      </div>
    );
  }

  const userDetails = profileData?.user_details || {};
  const familyMembers = profileData?.family_members || [];
  const unitHomeowners = profileData?.unit_homeowners || [];
  const vehicles = profileData?.vehicles || [];
  const pets = profileData?.pets || [];
  const education = profileData?.education || [];
  const experience = profileData?.experience || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <ProfileHeaderCard
        userDetails={userDetails}
        associationName={associationName}
        email={account?.email || profile?.email}
        role={account?.role}
        roleCode={account?.role_code}
        onRefresh={refetch}
      />

      <ProfileDetailsCard
        userDetails={userDetails}
        familyMembers={familyMembers}
        unitHomeowners={unitHomeowners}
        isEmployee={isEmployee}
        role={account?.role}
        roleCode={account?.role_code}
        defaultEmail={account?.email || profile?.email}
      />

      {isSuper ? (
        <div className="space-y-6">
          <SuperAdminOverviewCard />
          {/* <SuperAdminSecurityCard
            email={account?.email || profile?.email}
            createdAt={account?.created_at}
          /> */}
        </div>
      ) : isEmployee ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <EducationListSection
            education={education}
            onAddEducation={handleAddEducation}
            onEditEducation={handleEditEducation}
            onDeleteEducation={handleDeleteEducation}
          />
          <ExperienceListSection
            experience={experience}
            onAddExperience={handleAddExperience}
            onEditExperience={handleEditExperience}
            onDeleteExperience={handleDeleteExperience}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <VehicleListSection
            vehicles={vehicles}
            onAddVehicle={handleAddVehicle}
            onEditVehicle={handleEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
          <PetListSection
            pets={pets}
            onAddPet={handleAddPet}
            onEditPet={handleEditPet}
            onDeletePet={handleDeletePet}
          />
        </div>
      )}

      {/* Modals */}
      <VehicleFormModal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        initialData={editingVehicle}
        onSuccess={refetch}
      />

      <PetFormModal
        isOpen={showPetModal}
        onClose={() => setShowPetModal(false)}
        initialData={editingPet}
        onSuccess={refetch}
      />

      <EducationFormModal
        isOpen={showEduModal}
        onClose={() => setShowEduModal(false)}
        initialData={editingEdu}
        onSuccess={refetch}
      />

      <ExperienceFormModal
        isOpen={showExpModal}
        onClose={() => setShowExpModal(false)}
        initialData={editingExp}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Modals */}
      <DeleteModal
        isOpen={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        onDelete={handleConfirmDeleteVehicle}
        itemName={vehicleToDelete?.registration_number}
        itemType="Vehicle"
        description={
          vehicleToDelete
            ? `Are you sure you want to delete vehicle "${vehicleToDelete.registration_number}"? This action cannot be undone.`
            : undefined
        }
        isDeleting={isDeletingVehicle}
      />

      <DeleteModal
        isOpen={Boolean(petToDelete)}
        onClose={() => setPetToDelete(null)}
        onDelete={handleConfirmDeletePet}
        itemName={petToDelete?.name}
        itemType="Pet"
        description={
          petToDelete
            ? `Are you sure you want to delete pet "${petToDelete.name}"? This action cannot be undone.`
            : undefined
        }
        isDeleting={isDeletingPet}
      />

      <DeleteModal
        isOpen={Boolean(educationToDelete)}
        onClose={() => setEducationToDelete(null)}
        onDelete={handleConfirmDeleteEducation}
        itemName={educationToDelete?.degree || educationToDelete?.institution}
        itemType="Education Record"
        description={
          educationToDelete
            ? `Are you sure you want to delete the education record for "${
                educationToDelete.degree
                  ? `${educationToDelete.degree} at ${educationToDelete.institution}`
                  : educationToDelete.institution
              }"? This action cannot be undone.`
            : undefined
        }
        isDeleting={isDeletingEducation}
      />

      <DeleteModal
        isOpen={Boolean(experienceToDelete)}
        onClose={() => setExperienceToDelete(null)}
        onDelete={handleConfirmDeleteExperience}
        itemName={
          experienceToDelete?.job_title
            ? `${experienceToDelete.job_title} at ${experienceToDelete.company}`
            : experienceToDelete?.company
        }
        itemType="Experience Record"
        description={
          experienceToDelete
            ? `Are you sure you want to delete the experience record for "${
                experienceToDelete.job_title
                  ? `${experienceToDelete.job_title} at ${experienceToDelete.company}`
                  : experienceToDelete.company
              }"? This action cannot be undone.`
            : undefined
        }
        isDeleting={isDeletingExperience}
      />
    </div>
  );
};

export default UserProfilePage;
