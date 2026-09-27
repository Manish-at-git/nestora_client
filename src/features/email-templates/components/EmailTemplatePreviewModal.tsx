import React, { useEffect, useState } from "react";
import { Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalWrapper } from "@/components/common";
import type { EmailTemplate } from "../types";
import { renderEmailTemplate } from "../utils";

interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
}

export const EmailTemplatePreviewModal: React.FC<
  EmailTemplatePreviewModalProps
> = ({ isOpen, onClose, template }) => {
  const [previewTemplate, setPreviewTemplate] =
    useState<EmailTemplate | null>(template || null);

  useEffect(() => {
    if (template) {
      setPreviewTemplate(template);
    }
  }, [template]);

  if (!previewTemplate) {
    return null;
  }

  const renderedSubject = renderEmailTemplate(previewTemplate.subject);
  const renderedBody = renderEmailTemplate(previewTemplate.body);
  const previewDocument =
    "<!doctype html><html><head><meta charset='utf-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<style>*,*::before,*::after{box-sizing:border-box}" +
    "html,body{max-width:100%;overflow-x:hidden}" +
    "body{font-family:Arial,sans-serif;color:#1e293b;padding:24px;" +
    "line-height:1.6;margin:0}img{max-width:100%;height:auto}</style>" +
    "</head><body>" +
    renderedBody +
    "</body></html>";

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={"Email Preview: " + previewTemplate.name}
      icon={<Eye size={18} />}
      size="3xl"
      className="h-[90vh]"
      bodyClassName="p-4 sm:p-5 overflow-hidden"
      footer={
        <Button type="button" onClick={onClose}>
          Close Preview
        </Button>
      }
    >
      <div className="h-full min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <div className="h-full min-h-0 bg-white p-3">
          <iframe
            title={"Preview of " + previewTemplate.name}
            srcDoc={previewDocument}
            sandbox=""
            className="h-full min-h-[420px] w-full rounded-lg border border-slate-100 bg-white"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EmailTemplatePreviewModal;
