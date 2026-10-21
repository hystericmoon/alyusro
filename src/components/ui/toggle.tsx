// shadcn/ui Toggle (Radix), restyled with the Al Yusro tokens only.
// Radix renders `aria-pressed`, which the filter chips require.
import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'inline-flex cursor-pointer items-center gap-8 rounded-sm border font-body font-bold leading-[1.2] transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        chip: [
          'border-chip-rule bg-white text-ink hover:border-ink',
          'data-[state=on]:border-ink data-[state=on]:bg-ink data-[state=on]:text-white',
        ],
      },
      size: {
        default: 'min-h-44 px-14 text-15',
      },
    },
    defaultVariants: { variant: 'chip', size: 'default' },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />;
}

export { Toggle, toggleVariants };
