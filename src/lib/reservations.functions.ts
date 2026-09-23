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

export const submitReservation = createServerFn({ method: "POST" })
  .validator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = await import("@/lib/email.server");

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

    // No fallback address: epicrestaurant.test isn't a deliverable domain, so
    // the old default turned a missing variable into a silent bounce.
    const staffTo = process.env.RESTAURANT_EMAIL;
    const [guestSent] = await Promise.all([
      email.sendEmail(
        data.email,
        "We've received your Epic Restaurant booking",
        email.receivedEmail(data),
      ),
      staffTo
        ? email.sendEmail(
            staffTo,
            `New booking · ${data.name} · ${email.formatDate(data.reservation_date)}`,
            email.staffNotificationEmail(data),
          )
        : Promise.resolve(null),
    ]);

    return { id: row.id as string, emailed: guestSent.sent };
  });
