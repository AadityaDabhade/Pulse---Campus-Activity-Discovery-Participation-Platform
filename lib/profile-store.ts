import { useEffect, useState } from "react";

const KEY = "pulse_profile";
const EVT = "pulse-profile-change";

export type Profile = {
  name: string;
  year: string;
  department: string;
  hall: string;
  gender: string;
  email: string;
  phone: string;
  photo?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  hostVerifiedAt?: number;
};

export const DEFAULT_PROFILE: Profile = {
  name: "Aaditya D.",
  year: "3rd Year",
  department: "Computer Science & Engineering",
  hall: "RP Hall",
  gender: "Male",
  email: "adityad21@kgpian.iitkgp.ac.in",
  phone: "",
  photo: undefined,
  phoneVerified: false,
  emailVerified: true,
  hostVerifiedAt: undefined,
};

export function getProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function updateProfile(patch: Partial<Profile>) {
  saveProfile({ ...getProfile(), ...patch });
}

export function useProfile(): Profile {
  const [p, setP] = useState<Profile>(getProfile);
  useEffect(() => {
    const h = () => setP(getProfile());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return p;
}

export function isHostReady(p: Profile) {
  return Boolean(p.phoneVerified && p.phone && p.photo);
}

// ---------------------------------------------------------------------------
// Supabase-backed profile hook
// Fetches the user's profile from the database.
// Use this in new code; the localStorage hooks above are kept for backward
// compat with existing pages until they are migrated in a later phase.
// ---------------------------------------------------------------------------
import { supabase, fetchProfile, type SupabaseUserProfile } from "./supabase";

export function useSupabaseProfile(): {
  profile: SupabaseUserProfile | null;
  loading: boolean;
} {
  const [profile, setProfile] = useState<SupabaseUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      const p = await fetchProfile(user.id);
      if (!cancelled) {
        setProfile(p);
        setLoading(false);
      }
    }

    load();

    // Re-fetch on auth state changes (sign in / sign out)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      load();
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}