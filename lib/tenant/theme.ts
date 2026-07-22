const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const PLATFORM_DEFAULTS = {
  primary: "#170C79",
  secondary: "#EFE3CA",
  accent: "#56B6C6",
  dark: "#0E0850",
} as const;

/** Only ever pass DB/header-sourced color values through this before they reach a <style> tag. */
export function sanitizeHex(value: string | null | undefined, fallback: string): string {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

export function buildBrandThemeCSS(tenant: {
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_dark: string;
}): string {
  const primary = sanitizeHex(tenant.color_primary, PLATFORM_DEFAULTS.primary);
  const secondary = sanitizeHex(tenant.color_secondary, PLATFORM_DEFAULTS.secondary);
  const accent = sanitizeHex(tenant.color_accent, PLATFORM_DEFAULTS.accent);
  const dark = sanitizeHex(tenant.color_dark, PLATFORM_DEFAULTS.dark);

  return `:root{--brand-primary:${primary};--brand-secondary:${secondary};--brand-accent:${accent};--brand-dark:${dark};}`;
}
