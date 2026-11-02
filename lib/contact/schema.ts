import { z } from "zod";

/** Shared by the contact form and POST /api/contact. The honeypot is `website`. */
export const contactFormSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().min(3).max(200).email(),
    subject: z.string().trim().max(120).optional(),
    message: z.string().trim().min(10).max(2000),
    website: z.string().max(200).optional(),
  })
  .strip();

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export function emptySubject(subject: string | undefined): string | null {
  const trimmed = subject?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}
