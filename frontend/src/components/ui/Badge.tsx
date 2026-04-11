import type { ReactNode } from 'react';
import { colors } from '../../styles/tokens';

type BadgeColor =
  | 'green' | 'blue' | 'red' | 'amber' | 'purple'
  | 'teal'  | 'orange' | 'rose' | 'gray' | 'gold' | 'indigo';

interface BadgeProps {
  color?    : BadgeColor;
  children  : ReactNode;
  dot?      : boolean;
}

const colorMap: Record<BadgeColor, [string, string]> = {
  green  : [colors.successSoft, colors.success],
  blue   : [colors.blueSoft,   colors.blue],
  red    : [colors.dangerSoft, colors.danger],
  amber  : [colors.warnSoft,   '#b45309'],
  purple : [colors.purpleSoft, colors.purple],
  teal   : [colors.tealSoft,   colors.teal],
  orange : [colors.orangeSoft, colors.orange],
  rose   : [colors.roseSoft,   colors.rose],
  gray   : ['#f1f5f9',         colors.muted],
  gold   : [colors.goldSoft,   colors.gold],
  indigo : [colors.indigoSoft, colors.indigo],
};

export function Badge({ color = 'gray', children, dot = true }: BadgeProps) {
  const [bg, fg] = colorMap[color];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, fontWeight: 700,
      padding: '2px 8px', borderRadius: 20,
      background: bg, color: fg,
    }}>
      {dot && <span style={{ fontSize: 7 }}>●</span>}
      {children}
    </span>
  );
}
