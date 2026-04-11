import { cn } from '../../lib/utils';

type PortalColor =
  | 'indigo' | 'teal' | 'amber' | 'blue' | 'brown' | 'green'
  | 'purple' | 'rose' | 'cyan' | 'orange' | 'lime' | 'pink' | 'slate';

interface PortalButtonProps {
  icon: string;
  name: string;
  description: string;
  color: PortalColor;
  onClick?: () => void;
}

const borderColor: Record<PortalColor, string> = {
  indigo: 'border-l-indigo-500',
  teal:   'border-l-teal-500',
  amber:  'border-l-amber-400',
  blue:   'border-l-blue-500',
  brown:  'border-l-amber-800',
  green:  'border-l-emerald-500',
  purple: 'border-l-violet-500',
  rose:   'border-l-rose-500',
  cyan:   'border-l-cyan-500',
  orange: 'border-l-orange-500',
  lime:   'border-l-lime-500',
  pink:   'border-l-pink-500',
  slate:  'border-l-slate-600',
};

const iconBg: Record<PortalColor, string> = {
  indigo: 'bg-indigo-50',
  teal:   'bg-teal-50',
  amber:  'bg-amber-50',
  blue:   'bg-blue-50',
  brown:  'bg-amber-100',
  green:  'bg-emerald-50',
  purple: 'bg-violet-50',
  rose:   'bg-rose-50',
  cyan:   'bg-cyan-50',
  orange: 'bg-orange-50',
  lime:   'bg-lime-50',
  pink:   'bg-pink-50',
  slate:  'bg-slate-100',
};

export function PortalButton({ icon, name, description, color, onClick }: PortalButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3.5 bg-white border border-gray-200 border-l-4 rounded-xl text-left',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full group',
        borderColor[color]
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0', iconBg[color])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-gray-800 truncate">{name}</div>
        <div className="text-[11px] text-gray-400 mt-0.5 truncate">{description}</div>
      </div>
      <span className="text-gray-300 group-hover:text-gray-500 text-sm ml-auto">↗</span>
    </button>
  );
}
