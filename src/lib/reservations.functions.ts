import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(40),
  party_size: z.number().int().min(1).max(50),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reservation_time: z.string().regex(/^\d{1,2}:\d{2}$/),
  requests: z.string().max(1000).optional().nullable(),
});

function formatDate(iso: string) {
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

function guestHtml(data: z.infer<typeof schema>) {
  return `<!doctype html><html><body style="margin:0;background:#0f0e0c;font-family:Inter,Arial,sans-serif;color:#e9e4d8;padding:32px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:auto;background:#161412;border:1px solid #2a2622;border-radius:12px;overflow:hidden">
    <tr><td style="padding:32px 32px 8px 32px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:28px;color:#d4af37;letter-spacing:.5px">Epic Restaurant</div>
      <div style="font-size:11px;letter-spacing:.3em;color:#9b8f7a;text-transform:uppercase;margin-top:4px">Bulawayo</div>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 12px;color:#fff">Hi ${data.name},</h1>
      <p style="line-height:1.6;color:#cfc7b5;margin:0 0 20px">We've received your reservation request. Our team will confirm shortly. Here are your details:</p>
      <table cellpadding="6" style="width:100%;border-collapse:collapse;border-top:1px solid #2a2622;border-bottom:1px solid #2a2622;margin:12px 0">
        <tr><td style="color:#9b8f7a;font-size:12px;text-transform:uppercase;letter-spacing:.18em">Date</td><td style="text-align:right">${formatDate(data.reservation_date)}</td></tr>
        <tr><td style="color:#9b8f7a;font-size:12px;text-transform:uppercase;letter-spacing:.18em">Time</td><td style="text-align:right">${data.reservation_time}</td></tr>
        <tr><td style="color:#9b8f7a;font-size:12px;text-transform:uppercase;letter-spacing:.18em">Guests</td><td style="text-align:right">${data.party_size}</td></tr>
      </table>
      ${data.requests ? `<p style="color:#cfc7b5;font-size:14px;margin:16px 0 0"><strong style="color:#d4af37">Notes:</strong> ${data.requests}</p>` : ""}
      <p style="line-height:1.6;color:#cfc7b5;margin:24px 0 0">If anything changes, simply reply to this email or call us.</p>
    </td></tr>
    <tr><td style="padding:20px 32px;border-top:1px solid #2a2622;text-align:center;color:#6b6253;font-size:12px">
      Thank you for choosing Epic Restaurant. We can't wait to host you.
    </td></tr>
  </table></body></html>`;
}

function adminHtml(data: z.infer<typeof schema>) {
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;padding:24px">
  <h2 style="margin:0 0 12px">New reservation</h2>
  <table cellpadding="6" style="border-collapse:collapse">
    <tr><td><b>Name</b></td><td>${data.name}</td></tr>
    <tr><td><b>Email</b></td><td>${data.email}</td></tr>
    <tr><td><b>Phone</b></td><td>${data.phone}</td></tr>
    <tr><td><b>Date</b></td><td>${formatDate(data.reservation_date)}</td></tr>
    <tr><td><b>Time</b></td><td>${data.reservation_time}</td></tr>
    <tr><td><b>Guests</b></td><td>${data.party_size}</td></tr>
    <tr><td><b>Notes</b></td><td>${data.requests ?? "—"}</td></tr>
  </table></body></html>`;
}

export const submitReservation = createServerFn({ method: "POST" })
  .validator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("reservations")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        party_size: data.party_size,
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time,
        requests: data.requests ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const resendKey = process.env.RESEND_API_KEY;
    const adminTo = process.env.RESTAURANT_EMAIL || "bookings@epicrestaurant.test";

    if (resendKey) {
      const send = async (to: string, subject: string, html: string) => {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Epic Restaurant <onboarding@resend.dev>",
              to: [to],
              subject,
              html,
            }),
          });
          if (!res.ok) console.error("Resend failed", res.status, await res.text());
        } catch (e) {
          console.error("Resend error", e);
        }
      };

      await Promise.all([
        send(data.email, "We've received your Epic Restaurant booking", guestHtml(data)),
        send(
          adminTo,
          `New booking · ${data.name} · ${formatDate(data.reservation_date)}`,
          adminHtml(data),
        ),
      ]);
    } else {
      console.warn("RESEND_API_KEY not set — skipping email send");
    }

    return { id: row.id as string, emailed: !!resendKey };
  });
