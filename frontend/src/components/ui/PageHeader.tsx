import type { ReactNode, CSSProperties } from 'react';
import { colors } from '../../styles/tokens';
import { Btn } from './Btn';

interface Action {
  label    : string;
  onClick  : () => void;
  variant? : 'primary' | 'secondary' | 'danger';
  icon?    : string;
}

interface PageHeaderProps {
  title    : string;
  subtitle?: string;
  actions? : Action[];
  children?: ReactNode;
  style?   : CSSProperties;
}

export function PageHeader({ title, subtitle, actions = [], children, style }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20, flexWrap: 'wrap', gap: 10,
      ...style,
    }}>
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: colors.text, margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: colors.muted, marginTop: 3, marginBottom: 0 }}>{subtitle}</p>
        )}
      </div>
      {(actions.length > 0 || children) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {children}
          {actions.map(a => (
            <Btn key={a.label} variant={a.variant ?? 'secondary'} onClick={a.onClick}>
              {a.icon && <span>{a.icon}</span>}
              {a.label}
            </Btn>
          ))}
        </div>
      )}
    </div>
  );
}
