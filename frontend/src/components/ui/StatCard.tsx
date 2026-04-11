import { colors, shadows } from '../../styles/tokens';

type AccentColor = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal' | 'rose' | 'cyan' | 'orange' | 'indigo' | 'gold';

interface StatCardProps {
  title     : string;
  value     : string | number;
  icon      : string;
  accent    : AccentColor;
  trend?    : string;
  trendType?: 'up' | 'down' | 'flat';
  onClick?  : () => void;
}

const accentMap: Record<AccentColor, [string, string]> = {
  blue   : [colors.blue,    colors.blueSoft],
  green  : [colors.success, colors.successSoft],
  amber  : [colors.warn,    colors.warnSoft],
  red    : [colors.danger,  colors.dangerSoft],
  purple : [colors.purple,  colors.purpleSoft],
  teal   : [colors.teal,    colors.tealSoft],
  rose   : [colors.rose,    colors.roseSoft],
  cyan   : [colors.cyan,    colors.cyanSoft],
  orange : [colors.orange,  colors.orangeSoft],
  indigo : [colors.indigo,  colors.indigoSoft],
  gold   : [colors.gold,    colors.goldSoft],
};

const trendMap = {
  up   : [colors.successSoft, colors.success],
  down : [colors.dangerSoft,  colors.danger],
  flat : ['#f1f5f9',          colors.muted],
};

export function StatCard({ title, value, icon, accent, trend, trendType = 'flat', onClick }: StatCardProps) {
  const [borderCol, iconBg] = accentMap[accent];
  const [trendBg, trendFg]  = trendMap[trendType];
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.card, borderRadius: 12,
        padding: '16px 18px',
        border: `1px solid ${colors.border}`,
        borderTop: `3px solid ${borderCol}`,
        boxShadow: shadows.sm,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all .2s',
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
          {icon}
        </div>
        {trend && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: trendBg, color: trendFg }}>
            {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: colors.text }}>{value}</div>
      <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{title}</div>
    </div>
  );
}
