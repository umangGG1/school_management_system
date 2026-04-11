import type { ReactNode } from 'react';
import { colors } from '../../styles/tokens';

type AlertColor = 'warn' | 'danger' | 'info' | 'success';

interface AlertBannerProps {
  color?    : AlertColor;
  children  : ReactNode;
  icon?     : string;
}

const map: Record<AlertColor, [string, string, string]> = {
  warn    : [colors.warnSoft,    'rgba(245,158,11,.25)',   '#b45309'],
  danger  : [colors.dangerSoft,  'rgba(239,68,68,.25)',    colors.danger],
  info    : [colors.blueSoft,    'rgba(59,130,246,.25)',   colors.blue],
  success : [colors.successSoft, 'rgba(16,185,129,.25)',   colors.success],
};

export function AlertBanner({ color = 'warn', children, icon }: AlertBannerProps) {
  const [bg, border, textCol] = map[color];
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 9, padding: '10px 14px',
      marginBottom: 16, display: 'flex',
      alignItems: 'flex-start', gap: 10,
      fontSize: 12, fontWeight: 600, color: textCol,
    }}>
      {icon && <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
