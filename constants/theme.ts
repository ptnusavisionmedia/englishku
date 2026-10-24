/**
 * Glossy cartoon theme, matched to the EnglishKu illustrations: candy blue, red, orange and light
 * green on a very light sky background. Buttons and panels are drawn as glossy "candy" with a
 * darker bevel underneath. The app is light-only on purpose.
 */
export const palette = {
  light: {
    background: '#EEF7FF',
    surface: '#FFFFFF',
    text: '#1F55B5',
    textMuted: '#5B7FB8',
    /** Neutral outline (inputs, tracks, dividers). */
    border: '#BFDBFF',
    /** Bevel colour under white surfaces. */
    shadow: '#A9CBF5',
    link: '#1F6BEA',
    primary: '#3F8CFF',
    primaryText: '#FFFFFF',
    /** Text/icon colour on bright brand fills (gets a soft cartoon shadow automatically). */
    onBright: '#FFFFFF',
    blue: '#3F8CFF',
    red: '#FF4D5E',
    orange: '#FF9A2E',
    green: '#7ADB4F',
    success: '#7ADB4F',
    danger: '#FF4D5E',
    successText: '#2E8B1F',
    dangerText: '#D12A3E',
    star: '#FFC83D',
    tintBlue: '#DDEBFF',
    tintGreen: '#E3F8D6',
    tintYellow: '#FFEBD2',
    tintPink: '#FFDDE0',
    tintPurple: '#E6EFFF',
    tintOrange: '#FFE2C2',
  },
} as const;

export type ThemeColors = { [K in keyof (typeof palette)['light']]: string };
export type Tint =
  'tintBlue' | 'tintGreen' | 'tintYellow' | 'tintPink' | 'tintPurple' | 'tintOrange';

export const TINTS: Tint[] = [
  'tintBlue',
  'tintYellow',
  'tintGreen',
  'tintPink',
  'tintPurple',
  'tintOrange',
];

/** Bright fill for each tint, used for icon plates and accents. */
export const TINT_SOLID: Record<Tint, 'blue' | 'orange' | 'green' | 'red'> = {
  tintBlue: 'blue',
  tintGreen: 'green',
  tintYellow: 'orange',
  tintPink: 'red',
  tintPurple: 'blue',
  tintOrange: 'orange',
};

export const radius = { sm: 12, md: 16, lg: 22, full: 999 } as const;

/** Candy metrics: outline width and the height of the bevel under glossy shapes. */
export const brutal = { border: 3, offset: 5 } as const;
