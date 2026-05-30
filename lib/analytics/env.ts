/** BrandCure GA4 property — override with NEXT_PUBLIC_GA_MEASUREMENT_ID if needed. */
export const DEFAULT_GA_MEASUREMENT_ID = "G-R4HKCZKM4S";

/** Google Analytics 4 measurement ID (e.g. G-XXXXXXXXXX). */
export function getGaMeasurementId(): string | undefined {
  const id =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
    DEFAULT_GA_MEASUREMENT_ID;
  return id || undefined;
}

/** Microsoft Clarity project ID from Clarity → Settings → Setup. */
export function getClarityProjectId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  return id || undefined;
}
