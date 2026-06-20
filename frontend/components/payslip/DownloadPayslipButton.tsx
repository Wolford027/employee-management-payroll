"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { downloadPayslip } from "@/services";
import { apiErrorMessage } from "@/lib/api";

/**
 * Renders the payslip download button together with a confirmation modal.
 * The actual download only fires after the user confirms.
 */
export function DownloadPayslipButton({
  payslipId,
  filename,
  variant = "ghost",
  size = "sm",
  title = "Download",
  className,
  children,
}: {
  payslipId: number;
  filename: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await downloadPayslip(payslipId, filename);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not download payslip"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        title={title}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Download payslip?"
        confirmText={loading ? "Downloading…" : "Download"}
        loading={loading}
        icon={<Download className="h-5 w-5 text-blue-400" />}
      >
        This will download <span className="font-medium text-white">{filename}</span> as a PDF to your device.
      </ConfirmDialog>
    </>
  );
}
