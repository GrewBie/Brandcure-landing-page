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
