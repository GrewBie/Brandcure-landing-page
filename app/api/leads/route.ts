import { dispatchLeadEmails } from "@/lib/resend";
import { createLeadsClient } from "@/lib/supabase/leads-client";
import { leadFormSchema, leadSource } from "@/lib/validations";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

type NormalizedLead = {
  name: string;
  email: string;
  phone: string | null;
  business: string;
  challenge: string | null;
  source: typeof leadSource.website;
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

  const { error: insertError } = await supabase
    .from("leads")
    .insert({ ...row, id });

  if (insertError) {
    console.error("[leads] Supabase insert failed:", insertError.message);
    return { ok: false, error: insertError.message };
  }

  return { ok: true, id };
}

/** Website contact form only — AI agent conversations are not stored or emailed. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const row = normalizeLead(parsed.data);
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
    await dispatchLeadEmails(lead, { sendConfirmation: true });

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("[leads] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
