import { Resend } from "resend";
import { requireServerEnv } from "@/lib/env";
import type { LeadFormValues } from "@/lib/validations";

function getResend() {
  return new Resend(requireServerEnv("RESEND_API_KEY"));
}

/** Resend accepts `Name <email@domain.com>` — plain addresses get a display name. */
function getEmailFrom(): string {
  const raw = requireServerEnv("EMAIL_FROM").trim();
  if (/<[^>]+>/.test(raw)) return raw;
  return `BrandCure <${raw}>`;
}

function parseEmailList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return [...new Set(
    value
      .split(/[,;]/)
      .map((e) => e.trim())
      .filter(Boolean),
  )];
}

function getTeamInboxes(): string[] {
  const inboxes = parseEmailList(process.env.EMAIL_TO);
  if (inboxes.length === 0) {
    console.warn("[resend] EMAIL_TO is empty — team notifications skipped");
  }
  return inboxes;
}

function isSyntheticLeadEmail(email: string) {
  return /@leads\.brandcure\.in$/i.test(email);
}

export type StoredLead = LeadFormValues & {
  source: string;
  id?: string;
};

/** Sends confirmation to the email address submitted in the form. */
export async function sendLeadConfirmationEmail(lead: StoredLead) {
  const from = getEmailFrom();
  const resend = getResend();

  const { error } = await resend.emails.send({
    from,
    to: [lead.email],
    replyTo: from,
    subject: "We received your BrandCure audit request",
    text: buildLeadText(lead, "Thanks for requesting a free audit. Here is what we received:"),
    html: buildLeadHtml(
      lead,
      "Thanks for requesting a free audit",
      "We received your details and will send your custom audit within 24 hours.",
    ),
  });

  if (error) {
    throw new Error(`confirmation → ${lead.email}: ${error.message}`);
  }
}

/** Copy to team inboxes listed in EMAIL_TO (comma- or semicolon-separated). */
export async function sendLeadTeamNotification(lead: StoredLead) {
  const teamInboxes = getTeamInboxes();
  if (teamInboxes.length === 0) return;

  const from = getEmailFrom();
  const resend = getResend();
  const replyTo = isSyntheticLeadEmail(lead.email) ? from : lead.email;

  const { error } = await resend.emails.send({
    from,
    to: teamInboxes,
    replyTo,
    subject: `New lead (${lead.source}) — ${lead.name}`,
    text: buildLeadText(lead, "New lead from the website:"),
    html: buildLeadHtml(lead, "New free audit request", "Submitted via the contact form."),
  });

  if (error) {
    throw new Error(`team → ${teamInboxes.join(", ")}: ${error.message}`);
  }
}

/** Confirmation + team inbox — each send is independent so one failure does not block the other. */
export async function dispatchLeadEmails(
  lead: StoredLead,
  options: { sendConfirmation?: boolean } = {},
) {
  const sendConfirmation =
    options.sendConfirmation ?? !isSyntheticLeadEmail(lead.email);

  const jobs: { label: string; run: () => Promise<void> }[] = [];

  if (sendConfirmation) {
    jobs.push({
      label: "confirmation",
      run: () => sendLeadConfirmationEmail(lead),
    });
  }

  jobs.push({
    label: "team",
    run: () => sendLeadTeamNotification(lead),
  });

  const results = await Promise.allSettled(jobs.map((j) => j.run()));

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected") {
      console.error(`[resend] ${jobs[i].label} email failed:`, result.reason);
    }
  }
}

function buildLeadText(lead: StoredLead, heading: string) {
  return [
    heading,
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone?.trim() || "—"}`,
    `Business: ${lead.business}`,
    `Challenge: ${lead.challenge?.trim() || "—"}`,
    `Source: ${lead.source}`,
  ].join("\n");
}

function buildLeadHtml(lead: StoredLead, title: string, subtitle: string) {
  return `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111214; max-width: 520px;">
      <h2 style="font-family: Georgia, serif; font-weight: 500; margin: 0 0 8px;">${escapeHtml(title)}</h2>
      <p style="margin: 0 0 24px; color: #6b6e73;">${escapeHtml(subtitle)}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${row("Name", lead.name)}
        ${row("Email", lead.email, true)}
        ${row("Phone", lead.phone?.trim() || "—")}
        ${row("Business", lead.business)}
        ${row("Challenge", lead.challenge?.trim() || "—")}
        ${row("Source", lead.source)}
      </table>
      <p style="margin-top: 24px; color: #6b6e73; font-size: 13px;">— BrandCure Agency</p>
    </div>
  `;
}

function row(label: string, value: string, isEmail = false) {
  const display = isEmail
    ? `<a href="mailto:${escapeHtml(value)}" style="color: #2a2c30;">${escapeHtml(value)}</a>`
    : escapeHtml(value).replace(/\n/g, "<br/>");
  return `
    <tr>
      <td style="padding: 8px 12px 8px 0; color: #6b6e73; vertical-align: top; width: 100px;"><strong>${escapeHtml(label)}</strong></td>
      <td style="padding: 8px 0; color: #111214;">${display}</td>
    </tr>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
