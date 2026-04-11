import type { ReactNode, CSSProperties } from 'react';
import { colors } from '../../styles/tokens';

type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'dark' | 'orange' | 'rose' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface BtnProps {
  variant?  : Variant;
  size?     : Size;
  onClick?  : () => void;
  style?    : CSSProperties;
  disabled? : boolean;
  children  : ReactNode;
  type?     : 'button' | 'submit' | 'reset';
}

const variantStyles: Record<Variant, { bg: string; color: string; border: string }> = {
  primary   : { bg: colors.blue,       color: '#fff',         border: 'transparent'              },
  secondary : { bg: '#f8fafc',         color: colors.text,    border: colors.border               },
  danger    : { bg: colors.dangerSoft, color: colors.danger,  border: 'rgba(239,68,68,.25)'       },
  warning   : { bg: colors.warnSoft,   color: '#b45309',      border: 'rgba(245,158,11,.25)'      },
  success   : { bg: colors.successSoft,color: colors.success, border: 'rgba(16,185,129,.25)'      },
  dark      : { bg: colors.primary,    color: '#fff',         border: 'transparent'               },
  orange    : { bg: colors.orangeSoft, color: colors.orange,  border: 'rgba(249,115,22,.25)'      },
  rose      : { bg: colors.roseSoft,   color: colors.rose,    border: 'rgba(244,63,94,.25)'       },
  ghost     : { bg: 'transparent',     color: colors.muted,   border: 'transparent'               },
};

const sizeStyles: Record<Size, { padding: string; fontSize: number }> = {
  sm : { padding: '4px 10px',  fontSize: 11 },
  md : { padding: '7px 14px',  fontSize: 12 },
  lg : { padding: '10px 20px', fontSize: 13 },
};

export function Btn({ variant = 'secondary', size = 'md', onClick, style, disabled, children, type = 'button' }: BtnProps) {
  const { bg, color, border } = variantStyles[variant];
  const { padding, fontSize }  = sizeStyles[size];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding, fontSize, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${border}`,
        background: bg, color,
        borderRadius: 8, fontFamily: 'inherit',
        opacity: disabled ? 0.6 : 1,
        transition: 'all .15s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
