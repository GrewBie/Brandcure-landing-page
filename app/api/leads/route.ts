import { dispatchLeadEmails } from "@/lib/resend";
import { createLeadsClient } from "@/lib/supabase/leads-client";
import {
  agentLeadUpdateSchema,
  chatLeadSchema,
  leadFormSchema,
  leadSource,
  voiceLeadSchema,
  type LeadSource,
} from "@/lib/validations";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

type NormalizedLead = {
  name: string;
  email: string;
  phone: string | null;
  business: string;
  challenge: string | null;
  source: LeadSource;
  status: "new";
};

function normalizeLead(data: {
  name: string;
  email: string;
  phone?: string;
  business: string;
  challenge?: string;
}): NormalizedLead {
  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    business: data.business.trim(),
    challenge: data.challenge?.trim() || null,
    source: leadSource.website,
    status: "new",
  };
}

function normalizeChatLead(data: {
  name: string;
  whatsapp: string;
  business?: string;
  email?: string;
}): { row: NormalizedLead; hasRealEmail: boolean } {
  const realEmail = data.email?.trim().toLowerCase() || "";
  const placeholder = `chat-${data.whatsapp.replace(/[^0-9]/g, "") || Date.now()}@leads.brandcure.in`;
  return {
    hasRealEmail: Boolean(realEmail),
    row: {
      name: data.name.trim(),
      email: realEmail || placeholder,
      phone: data.whatsapp.trim(),
      business: data.business?.trim() || "Enquiry via AI chat",
      challenge: null,
      source: leadSource.chat,
      status: "new",
    },
  };
}

function normalizeVoiceLead(data: {
  name?: string;
  whatsapp?: string;
  email?: string;
  business?: string;
  city?: string;
  challenge?: string;
  interest?: string;
  transcriptSummary?: string;
  lastProjectTitle?: string;
}): { row: NormalizedLead; hasRealEmail: boolean } {
  const realEmail = data.email?.trim().toLowerCase() || "";
  const phoneDigits = data.whatsapp?.replace(/[^0-9]/g, "") || "";
  const placeholder = `voice-${phoneDigits || Date.now()}@leads.brandcure.in`;

  const challengeParts = [
    data.challenge?.trim(),
    data.city?.trim() ? `City: ${data.city.trim()}` : "",
    data.interest && data.interest !== "unknown"
      ? `Interest: ${data.interest}`
      : "",
    data.lastProjectTitle
      ? `Last project: ${data.lastProjectTitle}`
      : "",
    data.transcriptSummary?.trim()
      ? `\n\nConversation:\n${data.transcriptSummary.trim()}`
      : "",
  ].filter(Boolean);

  return {
    hasRealEmail: Boolean(realEmail),
    row: {
      name: data.name?.trim() || "Portfolio visitor",
      email: realEmail || placeholder,
      phone: data.whatsapp?.trim() || null,
      business: data.business?.trim() || "Enquiry via AI portfolio tour (Neha)",
      challenge: challengeParts.length > 0 ? challengeParts.join("\n") : null,
      source: leadSource.voice,
      status: "new",
    },
  };
}

function toEmailLead(row: NormalizedLead, id?: string) {
  return {
    id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    business: row.business,
    challenge: row.challenge ?? undefined,
    source: row.source,
  };
}

async function persistLead(row: NormalizedLead): Promise<{
  ok: boolean;
  id?: string;
  error?: string;
}> {
  const supabase = createLeadsClient();
  const id = randomUUID();

  // Insert without .select() — publishable keys can insert but cannot read rows (RLS).
  const { error: insertError } = await supabase
    .from("leads")
    .insert({ ...row, id });

  if (insertError) {
    console.error("[leads] Supabase insert failed:", insertError.message);
    return { ok: false, error: insertError.message };
  }

  return { ok: true, id };
}

async function updateLead(
  id: string,
  row: Partial<
    Pick<NormalizedLead, "name" | "email" | "phone" | "business" | "challenge">
  >,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createLeadsClient();
  const { error } = await supabase.from("leads").update(row).eq("id", id);

  if (error) {
    console.error("[leads] Supabase update failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { source?: string };

    let row: NormalizedLead;
    let hasRealEmail = true;

    if (body?.source === "chat") {
      const parsed = chatLeadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid form data", details: parsed.error.flatten() },
          { status: 400 },
        );
      }
      const result = normalizeChatLead(parsed.data);
      row = result.row;
      hasRealEmail = result.hasRealEmail;
    } else if (body?.source === "voice") {
      const parsed = voiceLeadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid form data", details: parsed.error.flatten() },
          { status: 400 },
        );
      }
      const result = normalizeVoiceLead(parsed.data);
      row = result.row;
      hasRealEmail = result.hasRealEmail;
    } else {
      const parsed = leadFormSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid form data", details: parsed.error.flatten() },
          { status: 400 },
        );
      }
      row = normalizeLead(parsed.data);
    }

    const saved = await persistLead(row);
    if (!saved.ok) {
      return NextResponse.json(
        {
          error: "Could not save your request. Please try again.",
          detail: saved.error,
        },
        { status: 500 },
      );
    }

    const lead = toEmailLead(row, saved.id);

    await dispatchLeadEmails(lead, { sendConfirmation: hasRealEmail });

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("[leads] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

/** Update an existing voice/chat lead as the conversation progresses. */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = agentLeadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id, source, ...fields } = parsed.data;
    let row: NormalizedLead;
    let hasRealEmail = false;

    if (source === "voice") {
      const result = normalizeVoiceLead(fields);
      row = result.row;
      hasRealEmail = result.hasRealEmail;
    } else {
      const result = normalizeChatLead({
        name: fields.name ?? "Chat visitor",
        whatsapp: fields.whatsapp ?? "0000000000",
        business: fields.business,
        email: fields.email,
      });
      row = result.row;
      hasRealEmail = result.hasRealEmail;
    }

    const updated = await updateLead(id, {
      name: row.name,
      email: row.email,
      phone: row.phone,
      business: row.business,
      challenge: row.challenge,
    });

    if (!updated.ok) {
      return NextResponse.json(
        { error: "Could not update lead.", detail: updated.error },
        { status: 500 },
      );
    }

    await dispatchLeadEmails(toEmailLead(row, id), { sendConfirmation: false });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[leads] PATCH error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
