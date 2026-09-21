import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
// Type-only, so it is erased at build time and email.server never reaches the
// client bundle — the value import stays dynamic inside the handler below.
import type { EmailResult } from "@/lib/email.server";

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  // Lets an admin change status quietly, e.g. when fixing a mistake.
  notifyGuest: z.boolean().default(true),
});

/**
 * Changes a reservation's status and, for confirmed/cancelled, emails the guest.
 * Runs as the signed-in user, so RLS rejects anyone who isn't an admin.
 */
export const updateReservationStatus = createServerFn({ method: "POST" })
  .validator((d: unknown) => statusSchema.parse(d))
  .handler(async ({ data }) => {
    const { createUserClient } = await import("@/lib/admin.server");
    const email = await import("@/lib/email.server");
    const supabase = createUserClient();

    const { data: row, error } = await supabase
      .from("reservations")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("name,email,phone,party_size,reservation_date,reservation_time,requests,status")
      .maybeSingle();
    if (error) throw new Error(error.message);
    // RLS hides the row from non-admins, so "no row" covers both cases.
    if (!row) throw new Error("Reservation not found, or you don't have admin access.");

    let result: EmailResult | null = null;
    if (data.notifyGuest && (data.status === "confirmed" || data.status === "cancelled")) {
      result =
        data.status === "confirmed"
          ? await email.sendEmail(
              row.email,
              "Your Epic Restaurant table is confirmed",
              email.confirmedEmail(row),
            )
          : await email.sendEmail(
              row.email,
              "Your Epic Restaurant reservation was cancelled",
              email.cancelledEmail(row),
            );
    }

    return {
      status: row.status,
      guestEmail: row.email,
      emailed: result?.sent ?? false,
      // Null when we never tried (e.g. a quiet status change), so the UI can
      // tell "didn't send" apart from "wasn't meant to send".
      emailError: result && !result.sent ? result.reason : null,
      emailConfigured: email.emailEnabled(),
    };
  });
