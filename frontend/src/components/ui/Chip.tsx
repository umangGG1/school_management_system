import { cn } from '../../lib/utils';

export type ChipVariant = 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'teal' | 'gray' | 'rose';

interface ChipProps {
  variant: ChipVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ChipVariant, string> = {
  green:  'bg-emerald-50 text-emerald-700',
  red:    'bg-red-50 text-red-600',
  amber:  'bg-amber-50 text-amber-700',
  blue:   'bg-blue-50 text-blue-600',
  purple: 'bg-violet-50 text-violet-600',
  teal:   'bg-teal-50 text-teal-600',
  gray:   'bg-gray-100 text-gray-500',
  rose:   'bg-rose-50 text-rose-600',
};

export function Chip({ variant, children, className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
        variantStyles[variant],
        className
      )}
    >
      <span className="text-[8px]">●</span>
      {children}
    </span>
  );
}
