import type { ReactNode, CSSProperties } from 'react';
import { colors } from '../../styles/tokens';

const fieldStyle: CSSProperties = {
  width: '100%', padding: '8px 11px',
  border: `1px solid ${colors.border}`,
  borderRadius: 8, fontSize: 12,
  fontFamily: 'inherit', background: '#f8fafc',
  color: colors.text, outline: 'none',
  boxSizing: 'border-box',
};

interface FormFieldProps {
  label     : string;
  children  : ReactNode;
  required? : boolean;
}
export function FormField({ label, children, required }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, color: colors.muted,
        marginBottom: 5, display: 'block',
        textTransform: 'uppercase', letterSpacing: '.04em',
      }}>
        {label}{required && <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** handled by FormField */
}
export function TextInput(props: TextInputProps) {
  return <input {...props} style={{ ...fieldStyle, ...props.style }} />;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}
export function SelectInput({ children, ...props }: SelectInputProps) {
  return <select {...props} style={{ ...fieldStyle, ...props.style }}>{children}</select>;
}

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
}
export function TextAreaInput({ minHeight = 72, ...props }: TextAreaInputProps) {
  return (
    <textarea
      {...props}
      style={{ ...fieldStyle, resize: 'vertical', minHeight, ...props.style }}
    />
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
}
