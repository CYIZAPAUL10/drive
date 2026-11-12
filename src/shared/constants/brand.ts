// Set width and height to your files' real pixel sizes.
export const LOGO = {
  onDark: { src: '/images/logo-on-dark.png', width: 400, height: 120 },
  onLight: { src: '/images/logo-on-light.png', width: 400, height: 120 },
} as const;

export type LogoVariant = keyof typeof LOGO;