export interface UnitDocumentOption {
  id: number;
  label: string;
}

export const UNIT_DOCUMENT_TYPES: UnitDocumentOption[] = [
  { id: 1, label: "Unit Plan" },
  { id: 2, label: "Insurance" },
  { id: 3, label: "Property Document" },
  { id: 4, label: "Other" },
];

export const getUnitDocumentTypeId = (
  label?: string | null,
): number | undefined => {
  return UNIT_DOCUMENT_TYPES.find((option) => option.label === label)?.id;
};

export const getUnitDocumentTypeLabel = (
  id?: number | null,
): string | undefined => {
  return UNIT_DOCUMENT_TYPES.find((option) => option.id === id)?.label;
};
