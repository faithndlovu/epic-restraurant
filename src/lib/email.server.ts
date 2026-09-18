// Server-only email helpers (Resend). Load inside server function handlers:
//   const { sendEmail } = await import("@/lib/email.server");
// *.functions.ts files ship to the client bundle, so never import this at top level there.

export type ReservationDetails = {
  name: string;
  email: string;
  phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  requests?: string | null;
};

// Every user-supplied value is escaped before it goes into email HTML, so a
// name like "<a href=...>" renders as text instead of live markup.
export function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatDate(iso: string) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** True when an email provider is configured; callers report this back to the UI. */
export function emailEnabled() {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Sends one email through Resend. Never throws: a failed email must not undo a
 * booking or a status change that already succeeded. Returns whether it sent.
 */
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping email to", to);
    return false;
  }
  // Resend's shared onboarding@resend.dev sender only delivers to the Resend
  // account owner. Set EMAIL_FROM to an address on a domain you verified in Resend.
  const from = process.env.EMAIL_FROM || "Epic Restaurant <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error("Resend failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Resend error", e);
    return false;
  }
}

function layout(heading: string, intro: string, d: ReservationDetails, footer: string) {
  const row = (label: string, value: string) =>
    `<tr><td style="color:#9b8f7a;font-size:12px;text-transform:uppercase;letter-spacing:.18em">${label}</td><td style="text-align:right">${value}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#0f0e0c;font-family:Inter,Arial,sans-serif;color:#e9e4d8;padding:32px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:auto;background:#161412;border:1px solid #2a2622;border-radius:12px;overflow:hidden">
    <tr><td style="padding:32px 32px 8px 32px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:28px;color:#d4af37;letter-spacing:.5px">Epic Restaurant</div>
      <div style="font-size:11px;letter-spacing:.3em;color:#9b8f7a;text-transform:uppercase;margin-top:4px">Bulawayo</div>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 12px;color:#fff">${heading}</h1>
      <p style="line-height:1.6;color:#cfc7b5;margin:0 0 20px">${intro}</p>
      <table cellpadding="6" style="width:100%;border-collapse:collapse;border-top:1px solid #2a2622;border-bottom:1px solid #2a2622;margin:12px 0">
        ${row("Date", formatDate(d.reservation_date))}
        ${row("Time", escapeHtml(d.reservation_time))}
        ${row("Guests", escapeHtml(d.party_size))}
      </table>
      ${d.requests ? `<p style="color:#cfc7b5;font-size:14px;margin:16px 0 0"><strong style="color:#d4af37">Notes:</strong> ${escapeHtml(d.requests)}</p>` : ""}
      <p style="line-height:1.6;color:#cfc7b5;margin:24px 0 0">If anything changes, simply reply to this email or call us.</p>
    </td></tr>
    <tr><td style="padding:20px 32px;border-top:1px solid #2a2622;text-align:center;color:#6b6253;font-size:12px">
      ${footer}
    </td></tr>
  </table></body></html>`;
}

export function receivedEmail(d: ReservationDetails) {
  return layout(
    `Hi ${escapeHtml(d.name)},`,
    "We've received your reservation request. Our team will confirm shortly. Here are your details:",
    d,
    "Thank you for choosing Epic Restaurant. We can't wait to host you.",
  );
}

export function confirmedEmail(d: ReservationDetails) {
  return layout(
    `You're booked, ${escapeHtml(d.name)}!`,
    "Great news — your table is confirmed. We look forward to seeing you:",
    d,
    "See you soon at Epic Restaurant.",
  );
}

export function cancelledEmail(d: ReservationDetails) {
  return layout(
    `Hi ${escapeHtml(d.name)},`,
    "Unfortunately we're unable to host this reservation and it has been cancelled. Please call us or book another time — we'd love to have you:",
    d,
    "We're sorry for the inconvenience. — Epic Restaurant",
  );
}

export function staffNotificationEmail(d: ReservationDetails) {
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;padding:24px">
  <h2 style="margin:0 0 12px">New reservation</h2>
  <table cellpadding="6" style="border-collapse:collapse">
    <tr><td><b>Name</b></td><td>${escapeHtml(d.name)}</td></tr>
    <tr><td><b>Email</b></td><td>${escapeHtml(d.email)}</td></tr>
    <tr><td><b>Phone</b></td><td>${escapeHtml(d.phone)}</td></tr>
    <tr><td><b>Date</b></td><td>${formatDate(d.reservation_date)}</td></tr>
    <tr><td><b>Time</b></td><td>${escapeHtml(d.reservation_time)}</td></tr>
    <tr><td><b>Guests</b></td><td>${escapeHtml(d.party_size)}</td></tr>
    <tr><td><b>Notes</b></td><td>${d.requests ? escapeHtml(d.requests) : "—"}</td></tr>
  </table></body></html>`;
}
