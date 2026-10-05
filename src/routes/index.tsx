import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Result = { error?: string; name?: string; signedIn?: boolean };

declare global {
  interface Window {
    pokeaymanAuth?: {
      userId: string | null;
      getToken: () => Promise<string | null>;
      getProfile: () => Promise<{ name: string }>;
      signIn: (email: string, password: string) => Promise<Result>;
      signUp: (email: string, password: string, name: string, school: string) => Promise<Result>;
      signInWithGoogle: () => Promise<Result>;
      resetPassword: (email: string) => Promise<Result>;
      signOut: () => Promise<void>;
      email: string | null;
      getAccount: () => Promise<{ email: string; displayName: string; school: string } | null>;
      updateProfile: (name: string, school: string) => Promise<Result>;
      updatePassword: (password: string) => Promise<Result>;
    };
  }
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PokéAyman — Pokémon classroom adventures" },
      { name: "description", content: "PokéAyman's Pokémon-inspired classroom app for teachers and students." },
      { property: "og:title", content: "PokéAyman — Pokémon classroom adventures" },
      { property: "og:description", content: "PokéAyman's Pokémon-inspired classroom app for teachers and students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

async function profileName(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return "Teacher";
  // Cloud admins enter as the built-in "Ayman" Admin identity, inheriting all its permissions.
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
  if (roles?.some((r) => r.role === "admin")) return "Ayman";
  const { data: p } = await supabase.from("profiles").select("display_name").eq("id", u.id).maybeSingle();
  const name = p?.display_name || (u.user_metadata?.["display_name"] as string) || (u.user_metadata?.["full_name"] as string) || u.email?.split("@")[0] || "Teacher";
  // Non-admins may not take the reserved Admin name.
  return /^(teacher\s+)?ayman$/i.test(name.trim()) ? `${name.trim()} (Teacher)` : name;
}

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") { setUser(null); setFrameKey((k) => k + 1); }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Bridge read by the same-origin PokéAyman iframe for teacher accounts and saves.
  if (typeof window !== "undefined") {
    window.pokeaymanAuth = {
      userId: user?.id ?? null,
      getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
      getProfile: async () => ({ name: await profileName() }),
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message.includes("confirm") ? "Please confirm your email first (check your inbox)." : "Wrong email or password." };
        if (window.pokeaymanAuth) window.pokeaymanAuth.userId = data.user?.id ?? null;
        return { name: await profileName() };
      },
      signUp: async (email, password, name, school) => {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name, school } },
        });
        if (error) return { error: error.message };
        return { signedIn: !!data.session };
      },
      signInWithGoogle: async () => {
        const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
        if (r.error) return { error: "Google sign-in failed. Please try again." };
        if (r.redirected) return {};
        return { name: await profileName() };
      },
      resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        return error ? { error: error.message } : {};
      },
      signOut: async () => { await supabase.auth.signOut(); },
      email: user?.email ?? null,
      getAccount: async () => {
        const { data } = await supabase.auth.getUser();
        const u = data.user;
        if (!u) return null;
        const { data: p } = await supabase.from("profiles").select("display_name, school").eq("id", u.id).maybeSingle();
        return { email: u.email ?? "", displayName: p?.display_name ?? "", school: p?.school ?? "" };
      },
      updateProfile: async (name, school) => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return { error: "Not signed in" };
        const { error } = await supabase.from("profiles").upsert({ id: data.user.id, display_name: name.slice(0, 80), school: school.slice(0, 120) || null });
        return error ? { error: error.message } : {};
      },
      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        return error ? { error: error.message } : {};
      },
    };
  }

  if (!ready) return null;
  return <iframe key={frameKey} className="imported-app" title="PokéAyman" src="/pokeayman/index.html" />;
}
