import { createClient } from "@supabase/supabase-js";
import WebSocket from "isomorphic-ws";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetch,
  },
  realtime: {
    transport: WebSocket as any,
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SupabaseUserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  graduation_year: string | null;
  hall: string | null;
  phone_verified: boolean;
  host_verified_at: string | null;
  avatar_url: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the current session (null if logged out). */
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/** Get the current authenticated user (null if logged out). */
export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Fetch the app profile for the given user ID from `public.users`.
 * Returns null if no row found.
 */
export async function fetchProfile(
  userId: string,
): Promise<SupabaseUserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // PGRST116 = no rows found — expected for brand-new users before trigger fires
    if (error.code === "PGRST116") return null;
    console.error("fetchProfile error:", error);
    return null;
  }
  return data as SupabaseUserProfile;
}

/**
 * Returns true if the user's onboarding profile is complete
 * (name and hall are both filled in).
 */
export function isProfileComplete(
  profile: SupabaseUserProfile | null,
): boolean {
  return Boolean(profile?.name && profile?.hall);
}
