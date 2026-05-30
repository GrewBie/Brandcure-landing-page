import { Resend } from "resend";
import { requireServerEnv } from "@/lib/env";
import type { LeadFormValues } from "@/lib/validations";

function getResend() {
  return new Resend(requireServerEnv("RESEND_API_KEY"));
}

export type StoredLead = LeadFormValues & {
  source: string;
  id?: string;
};

/** Sends confirmation to the email address submitted in the form. */
export async function sendLeadConfirmationEmail(lead: StoredLead) {
  const from = requireServerEnv("EMAIL_FROM");
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
    throw new Error(error.message);
  }
}

function parseEmailList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function isSyntheticLeadEmail(email: string) {
  return /@leads\.brandcure\.in$/i.test(email);
}

/** Optional copy to team inboxes (EMAIL_TO — comma-separated). */
export async function sendLeadTeamNotification(lead: StoredLead) {
  const teamInboxes = parseEmailList(process.env.EMAIL_TO);
  if (teamInboxes.length === 0) return;

  const from = requireServerEnv("EMAIL_FROM");
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
    throw new Error(error.message);
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
