/**
 * Branding config — change these to rebrand the platform in one place.
 *
 * PLATFORM_NAME      : Short product name shown in nav, footer, page title.
 * CREATORS_TERM      : Singular noun for "creator" (e.g. "Creator", "Maker").
 * TAGLINE            : Hero headline text (word after "Launch Your").
 * CURRENCY_TERM      : What creator tokens are called in copy.
 * PLATFORM_FEE_PCT   : Platform fee percentage shown in marketing copy.
 */
export const PLATFORM_NAME = "CreatorHub";
export const CREATORS_TERM = "Creator";
export const TAGLINE = "Creator Economy.";
export const CURRENCY_TERM = "currency";
export const PLATFORM_FEE_PCT = "15%";

/**
 * Brand colors used across the landing page.
 * All gradient/accent uses reference these so you only change them once.
 * The same values are injected as CSS custom properties in index.css.
 */
export const BRAND_COLORS = {
  primary: "#7C3AED",   // violet — change to your primary
  secondary: "#F59E0B", // amber
  accent: "#EC4899",    // pink
} as const;

/** CSS linear-gradient string built from BRAND_COLORS */
export const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, ${BRAND_COLORS.secondary} 55%, ${BRAND_COLORS.primary} 100%)`;
