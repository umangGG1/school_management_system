/**
 * SMISSI Design Tokens
 * Single source of truth for all colours, shadows, and spacing used across portals.
 * Import from here instead of re-defining inline in every component.
 */

export const colors = {
  /* Neutral */
  primary : '#1e293b',
  bg      : '#f8fafc',
  card    : '#ffffff',
  border  : '#e2e8f0',
  text    : '#1e293b',
  muted   : '#64748b',
  light   : '#94a3b8',

  /* Semantic */
  success     : '#10b981',
  successSoft : '#ecfdf5',
  danger      : '#ef4444',
  dangerSoft  : '#fef2f2',
  warn        : '#f59e0b',
  warnSoft    : '#fffbeb',

  /* Accent palette */
  blue    : '#3b82f6',   blueSoft    : '#eff6ff',
  indigo  : '#6366f1',   indigoSoft  : '#eef2ff',
  purple  : '#8b5cf6',   purpleSoft  : '#f5f3ff',
  teal    : '#14b8a6',   tealSoft    : '#f0fdfa',
  green   : '#16a34a',   greenSoft   : '#f0fdf4',  greenDark : '#14532d',
  orange  : '#f97316',   orangeSoft  : '#fff7ed',
  rose    : '#f43f5e',   roseSoft    : '#fff1f2',
  amber   : '#f59e0b',   amberSoft   : '#fffbeb',
  gold    : '#d97706',   goldSoft    : '#fef3c7',
  cyan    : '#06b6d4',   cyanSoft    : '#ecfeff',
  lime    : '#65a30d',   limeSoft    : '#f7fee7',
  violet  : '#7c3aed',   violetSoft  : '#f5f3ff',
};

/**
 * Per-role accent colours.
 * Each portal picks one entry from this map.
 */
export const roleAccents = {
  headTeacher  : { acc: '#6366f1', accSoft: '#eef2ff', accDark: '#4338ca' },
  teacher      : { acc: '#2563eb', accSoft: '#eff6ff', accDark: '#1d4ed8' },
  bursar       : { acc: '#0f766e', accSoft: '#f0fdfa', accDark: '#0d5c57' },
  examOfficer  : { acc: '#7c3aed', accSoft: '#f5f3ff', accDark: '#4c1d95' },
  counsellor   : { acc: '#0d9488', accSoft: '#f0fdfa', accDark: '#0f766e' },
  eca          : { acc: '#16a34a', accSoft: '#f0fdf4', accDark: '#14532d' },
  deputyHM     : { acc: '#0ea5e9', accSoft: '#f0f9ff', accDark: '#0369a1' },
  hod          : { acc: '#8b5cf6', accSoft: '#f5f3ff', accDark: '#5b21b6' },
  nurse        : { acc: '#ec4899', accSoft: '#fdf2f8', accDark: '#be185d' },
  dormMaster   : { acc: '#f97316', accSoft: '#fff7ed', accDark: '#c2410c' },
  security     : { acc: '#dc2626', accSoft: '#fef2f2', accDark: '#991b1b' },
  student      : { acc: '#7c3aed', accSoft: '#f5f3ff', accDark: '#4c1d95' },
  parent       : { acc: '#059669', accSoft: '#ecfdf5', accDark: '#065f46' },
} as const;

export const shadows = {
  sm  : '0 1px 3px rgba(0,0,0,.06)',
  md  : '0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)',
  lg  : '0 4px 20px rgba(0,0,0,.10)',
  xl  : '0 20px 60px rgba(0,0,0,.20)',
} as const;

export const radii = {
  sm : 6,
  md : 8,
  lg : 12,
  xl : 14,
  full: 9999,
} as const;

/* Convenience re-export */
export default { colors, roleAccents, shadows, radii };
