import { useCallback, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type ConfirmOptions = {
  /** The question, as a short sentence. */
  title: string;
  /** What actually happens if they say yes. Required so no dialog is ever vague. */
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Paints the confirm button red. Use for anything that deletes or cancels. */
  destructive?: boolean;
};

/**
 * A replacement for the native `confirm()`, which renders as an unstyled browser
 * dialog labelled with the hostname ("localhost says…").
 *
 * Returns a promise so call sites keep reading top to bottom:
 *
 *   if (!(await confirm({ title: "Delete this?", description: "…" }))) return;
 *
 * Render the returned `dialog` somewhere in the component for it to appear.
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  // Clearing the ref first makes this idempotent: Radix closes the dialog after
  // an action's onClick, so settle() runs a second time via onOpenChange and
  // must not overwrite the answer we already gave.
  const settle = useCallback((ok: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setOptions(null);
    resolve?.(ok);
  }, []);

  const dialog = (
    <AlertDialog
      open={options !== null}
      onOpenChange={(open) => {
        if (!open) settle(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">{options?.title}</AlertDialogTitle>
          <AlertDialogDescription>{options?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>
            {options?.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => settle(true)}
            className={cn(
              options?.destructive &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {options?.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, dialog };
}
