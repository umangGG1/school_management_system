import { cn } from '../../lib/utils';

type DotColor = 'red' | 'amber' | 'blue' | 'green';

interface AlertItemProps {
  dot: DotColor;
  text: string;
  meta: string;
  actionLabel?: string;
  onAction?: () => void;
}

const dotStyles: Record<DotColor, string> = {
  red:   'bg-red-500 ring-4 ring-red-100',
  amber: 'bg-amber-400 ring-4 ring-amber-100',
  blue:  'bg-blue-500 ring-4 ring-blue-100',
  green: 'bg-emerald-500 ring-4 ring-emerald-100',
};

export function AlertItem({ dot, text, meta, actionLabel, onAction }: AlertItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-none">
      <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5', dotStyles[dot])} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-800">{text}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{meta}</p>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="ml-auto text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
