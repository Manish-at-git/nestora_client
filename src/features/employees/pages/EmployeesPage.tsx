import React, { useState } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import {
  EmployeeTable,
  EmployeeFormModal,
  ViewEmployeeModal,
} from "../components";
import { useGetEmployeesQuery } from "../api/employeesApi";
import type { Employee } from "../types";

export const EmployeesPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();

  usePageHeader({
    title: "Employees",
    description:
      "Manage platform operational staff, support personnel, and system administrator access.",
  });

  const {
    data: employees = [],
    isLoading,
    refetch,
  } = useGetEmployeesQuery(undefined, {
    skip: !canView,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null);

  const handleOpenAddModal = () => {
    setEmployeeToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsFormModalOpen(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setEmployeeToView(employee);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleCloseViewModal = () => {
    setEmployeeToView(null);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Employees" showAction />;
  }

  return (
    <div className="space-y-6">
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        onAdd={handleOpenAddModal}
        onView={handleViewEmployee}
        onEdit={handleOpenEditModal}
      />

      {/* Form Modal */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        employeeToEdit={employeeToEdit}
        onSuccess={() => refetch()}
      />

      {/* View Modal */}
      <ViewEmployeeModal
        employee={employeeToView}
        isOpen={Boolean(employeeToView)}
        onClose={handleCloseViewModal}
        onEdit={(emp) => handleOpenEditModal(emp)}
      />
    </div>
  );
};

export default EmployeesPage;
