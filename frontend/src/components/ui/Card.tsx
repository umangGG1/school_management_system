import type { ReactNode, CSSProperties } from 'react';
import { colors, shadows } from '../../styles/tokens';

interface CardProps {
  children : ReactNode;
  style?   : CSSProperties;
  className?: string;
}

interface CardHeaderProps {
  title   : ReactNode;
  action? : ReactNode;
  subtitle?: string;
}

export function Card({ children, style }: CardProps) {
  return (
    <div style={{
      background: colors.card, borderRadius: 12,
      border: `1px solid ${colors.border}`,
      boxShadow: shadows.md, padding: 18,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, subtitle }: CardHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
