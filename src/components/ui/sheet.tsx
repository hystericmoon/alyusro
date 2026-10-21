// shadcn/ui Sheet API (Sheet, SheetTrigger, SheetContent, SheetClose,
// SheetTitle), backed by the native <dialog> element instead of Radix Dialog:
// Radix 1.2 relies on React 19 internals that preact/compat does not provide.
// showModal() gives the same behaviour for free: focus moves in and returns to
// the trigger, Escape closes, and the rest of the page is inert.
// Restyled with the Al Yusro tokens only; no open/close animation.
import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SheetState = { open: boolean; setOpen: (v: boolean) => void; contentId: string; titleId: string };
const SheetContext = createContext<SheetState | null>(null);
const useSheet = () => {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('Sheet parts must be inside <Sheet>');
  return ctx;
};

function Sheet({ children, open: controlled, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlled ?? uncontrolled;
  const setOpen = (v: boolean) => {
    if (controlled === undefined) setUncontrolled(v);
    onOpenChange?.(v);
  };
  const id = useId();
  return (
    <SheetContext.Provider value={{ open, setOpen, contentId: `${id}-sheet`, titleId: `${id}-title` }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({ className, children, ...props }: ComponentProps<'button'>) {
  const { open, setOpen, contentId } = useSheet();
  return (
    <button
      type="button"
      data-slot="sheet-trigger"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={contentId}
      className={className}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
}

function SheetClose({ className, children, ...props }: ComponentProps<'button'>) {
  const { setOpen } = useSheet();
  return (
    <button type="button" data-slot="sheet-close" className={className} onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  );
}

function SheetContent({ className, children, side = 'right' }: { className?: string; children: ReactNode; side?: 'right' | 'left' }) {
  const { open, setOpen, contentId, titleId } = useSheet();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      id={contentId}
      data-slot="sheet-content"
      aria-labelledby={titleId}
      onClose={() => setOpen(false)}
      // A click on the backdrop lands on the <dialog> itself.
      onClick={(e) => {
        if (e.target === ref.current) setOpen(false);
      }}
      className={cn(
        'fixed inset-y-0 m-0 h-dvh max-h-none w-[min(100%,400px)] max-w-none flex-col overflow-y-auto border-0 bg-paper p-0 text-ink backdrop:bg-ink/60 open:flex',
        side === 'right' ? 'left-auto right-0 border-l border-rule' : 'left-0 right-auto border-r border-rule',
        className,
      )}
    >
      {children}
    </dialog>
  );
}

function SheetTitle({ className, children }: { className?: string; children: ReactNode }) {
  const { titleId } = useSheet();
  return (
    <h2 id={titleId} data-slot="sheet-title" className={cn('m-0 font-display', className)}>
      {children}
    </h2>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle };
