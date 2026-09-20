import React from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageHeader } from "@/hooks/usePageHeader";

export interface ModulePlaceholderProps {
  moduleName?: string;
  title?: string;
  moduleType?: string; // e.g. "Module", "Ledger", "Portal"
  description?: string;
  backText?: string;
  onBack?: () => void;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  moduleName = "Module",
  title,
  moduleType = "Module",
  description = "This workspace feature is connected and ready for sub-feature migration.",
  backText = "Back",
  onBack,
}) => {
  const navigate = useNavigate();
  const formattedTitle = title || moduleName.replace(/_/g, " ");

  usePageHeader({
    title: formattedTitle,
    description: description,
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-7xl mx-auto text-center py-20">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
        <Layers size={28} />
      </div>
      <h2 className="text-xl font-bold font-display text-slate-800 capitalize">
        {formattedTitle} {!title && moduleType}
      </h2>
      <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
        {description}
      </p>
      <Button
        variant="outline"
        onClick={handleBack}
        className="mt-6 text-xs cursor-pointer"
      >
        <ArrowLeft size={14} className="" /> {backText}
      </Button>
    </div>
  );
};

export default ModulePlaceholder;
