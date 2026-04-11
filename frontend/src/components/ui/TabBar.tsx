import type { ReactNode } from 'react';
import { colors } from '../../styles/tokens';

interface Tab {
  key   : string;
  label : string;
  icon? : string;
}

interface TabBarProps {
  tabs     : Tab[];
  active   : string;
  onChange : (key: string) => void;
  accent?  : string;
}

export function TabBar({ tabs, active, onChange, accent = colors.blue }: TabBarProps) {
  return (
    <div style={{
      display: 'flex', background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: 4,
      width: 'fit-content',
      boxShadow: '0 1px 3px rgba(0,0,0,.06)',
      marginBottom: 16, flexWrap: 'wrap', gap: 2,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: '6px 14px', borderRadius: 7,
            border: 'none',
            background: active === tab.key ? accent : 'transparent',
            color: active === tab.key ? '#fff' : colors.muted,
            fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all .15s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  active  : string;
  tabKey  : string;
  children: ReactNode;
}
export function TabPanel({ active, tabKey, children }: TabPanelProps) {
  if (active !== tabKey) return null;
  return <>{children}</>;
}
