import "server-only";
import { createClient } from "@supabase/supabase-js";

export type ContactMessageInsert = {
  name: string;
  email: string;
  subject: string | null;
  message: string;
};

export function contactStoreConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

/** Inserts a new message. The row has no IP column. */
export async function insertContactMessage(row: ContactMessageInsert): Promise<void> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("Supabase contact store is not configured.");
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.from("contact_messages").insert({
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: "new",
  });
  if (error) throw error;
}
