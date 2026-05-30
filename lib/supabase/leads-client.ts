import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/env";

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

/**
 * Supabase client for saving leads.
 * Prefers service role if set; otherwise uses publishable key (requires RLS insert policy).
 */
export function createLeadsClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const serviceRole = getSupabaseServiceRoleKey();

  if (serviceRole) {
    return createClient(url, serviceRole, clientOptions);
  }

  const publishable = getSupabasePublishableKey();
  if (publishable) {
    return createClient(url, publishable, clientOptions);
  }

  throw new Error(
    "Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
  );
}
