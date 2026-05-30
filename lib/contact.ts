/** WhatsApp / phone for BrandCure (digits only for wa.me). */
export const BRANDCURE_WHATSAPP_NUMBER = "918838924425";

export const BRANDCURE_WHATSAPP_DISPLAY = "+91 88389 24425";

export const BRANDCURE_TEL_URI = "+918838924425";

export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${BRANDCURE_WHATSAPP_NUMBER}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}
