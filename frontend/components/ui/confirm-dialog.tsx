"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * A confirmation modal built on top of {@link Dialog}.
 * Render it with an `open` flag driven by the "pending action" you want to confirm.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  loading = false,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonProps["variant"];
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} className="max-w-md">
      {(icon || children) && (
        <div className="mb-5 flex items-start gap-3">
          {icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}
            >
              {icon}
            </div>
          )}
          {children && <div className="text-sm text-slate-300 leading-relaxed">{children}</div>}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
}
