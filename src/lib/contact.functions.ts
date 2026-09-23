import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

/**
 * Stores a contact-form message, then tries to notify the restaurant.
 *
 * The insert is what makes the form honest — it happens first and its failure
 * is the only thing that fails the request. The email is best-effort: if Resend
 * is unconfigured the message still sits in contact_messages, so telling the
 * visitor "we got it" stays true either way. The caller gets `notified` so the
 * UI can say how the team will see it rather than guessing.
 */
export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = await import("@/lib/email.server");

    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error(error.message);

    // No fallback address: a made-up one just bounces, and a bounce is harder
    // to notice than an unset variable.
    const staffTo = process.env.RESTAURANT_EMAIL;
    const notified = staffTo
      ? await email.sendEmail(
          staffTo,
          `Website message · ${data.subject}`,
          email.contactNotificationEmail(data),
        )
      : { sent: false as const, reason: "RESTAURANT_EMAIL isn't configured on the server." };

    return { notified: notified.sent };
  });

const newsletterSchema = z.object({
  email: z.string().trim().email().max(255),
});

/**
 * Adds an address to the mailing list. Signing up twice is not an error from
 * the visitor's point of view, so the unique-violation the database raises is
 * translated into a normal result instead of being thrown.
 */
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((d: unknown) => newsletterSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email });

    // 23505 = unique_violation, i.e. already on the list.
    if (error && error.code !== "23505") throw new Error(error.message);
    return { alreadySubscribed: error?.code === "23505" };
  });
