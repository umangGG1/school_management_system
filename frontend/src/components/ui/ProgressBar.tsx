import { colors } from '../../styles/tokens';

type ProgressColor = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal' | 'orange' | 'gold';

interface ProgressBarProps {
  label  : string;
  value  : string;
  pct    : number;
  color? : ProgressColor;
}

const colorMap: Record<ProgressColor, string> = {
  blue   : colors.blue,
  green  : colors.success,
  amber  : colors.warn,
  red    : colors.danger,
  purple : colors.purple,
  teal   : colors.teal,
  orange : colors.orange,
  gold   : colors.gold,
};

export function ProgressBar({ label, value, pct, color = 'blue' }: ProgressBarProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.muted }}>{value}</span>
      </div>
      <div style={{ height: 7, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`,
          borderRadius: 10, background: colorMap[color],
          transition: 'width .4s ease',
        }} />
      </div>
    </div>
  );
}
