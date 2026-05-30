import { z } from "zod";

/** Matches Supabase `leads` table — used client + server when API is wired. */
export const leadFormSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  business: z.string().min(2, "Tell us about your business"),
  challenge: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

/** Inline lead capture from the AI chat — WhatsApp-first, email optional. */
export const chatLeadSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  whatsapp: z.string().min(6, "Please enter your WhatsApp number"),
  business: z.string().optional(),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
});

export type ChatLeadValues = z.infer<typeof chatLeadSchema>;

/** Voice tour (Neha) — contact fields optional; team always notified. */
export const voiceLeadSchema = z.object({
  source: z.literal("voice"),
  name: z.string().min(1).optional(),
  whatsapp: z.string().min(6).optional(),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  business: z.string().optional(),
  city: z.string().optional(),
  challenge: z.string().optional(),
  interest: z.string().optional(),
  transcriptSummary: z.string().optional(),
  lastProjectTitle: z.string().optional(),
});

export type VoiceLeadValues = z.infer<typeof voiceLeadSchema>;

export const agentLeadUpdateSchema = z.object({
  id: z.string().uuid(),
  source: z.enum(["voice", "chat"]),
  name: z.string().min(1).optional(),
  whatsapp: z.string().min(6).optional(),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  business: z.string().optional(),
  city: z.string().optional(),
  challenge: z.string().optional(),
  interest: z.string().optional(),
  transcriptSummary: z.string().optional(),
  lastProjectTitle: z.string().optional(),
});

export const leadSource = {
  website: "website",
  chat: "chat",
  voice: "voice",
  whatsapp: "whatsapp",
} as const;

export type LeadSource = (typeof leadSource)[keyof typeof leadSource];

export const contentTypeSchema = z.enum(["blog", "portfolio"]);

export const likeBodySchema = z.object({
  contentType: contentTypeSchema,
  contentId: z.string().min(1),
  visitorId: z.string().min(8).max(128),
});

export const commentBodySchema = z.object({
  contentType: contentTypeSchema,
  contentId: z.string().min(1),
  authorName: z.string().min(2).max(80),
  body: z.string().min(2).max(2000),
});
