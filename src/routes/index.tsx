import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { streamSpeech } from "@/lib/vocabulary-speech";
import homeHabitat from "@/assets/home-habitat.webp";

type Result = { error?: string; name?: string; signedIn?: boolean };

declare global {
  interface Window {
    pokeaymanSpeak?: (text: string, level?: string) => Promise<void>;
    pokeaymanStop?: () => void;
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
      updatePassword: (password: string, currentPassword: string) => Promise<Result>;
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

let activeSpeechController: AbortController | null = null;

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        try {
          sessionStorage.removeItem("pokeayman-login-session-id");
          sessionStorage.removeItem("pokeayman-streak-dismissed-session");
        } catch (_) {}
        setUser(null);
        setFrameKey((k) => k + 1);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Bridge read by the same-origin PokéAyman iframe for teacher accounts and saves.
  if (typeof window !== "undefined") {
    window.pokeaymanStop = () => {
      if (activeSpeechController) {
        activeSpeechController.abort();
        activeSpeechController = null;
      }
    };
    window.pokeaymanSpeak = (text, level = "P3") => {
      if (activeSpeechController) {
        activeSpeechController.abort();
      }
      activeSpeechController = new AbortController();
      return streamSpeech("/api/vocabulary-speech", text, level, activeSpeechController.signal);
    };
    window.pokeaymanAuth = {
      userId: user?.id ?? null,
      getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
      getProfile: async () => ({ name: await profileName() }),
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message.includes("confirm") ? "Please confirm your email first (check your inbox)." : "Wrong email or password." };
        if (window.pokeaymanAuth) { window.pokeaymanAuth.userId = data.user?.id ?? null; window.pokeaymanAuth.email = data.user?.email ?? null; }
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
      signOut: async () => {
        try {
          sessionStorage.removeItem("pokeayman-login-session-id");
          sessionStorage.removeItem("pokeayman-streak-dismissed-session");
        } catch (_) {}
        await supabase.auth.signOut();
      },
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
      updatePassword: async (password, currentPassword) => {
        if (!currentPassword || currentPassword.length > 1024) return { error: "Enter your current password." };
        if (password.length < 8 || password.length > 1024) return { error: "New password must be between 8 and 1024 characters." };
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user?.email) return { error: "Sign in again to change your password." };
        // Verify the existing credential with Cloud Auth before any password write,
        // even if the hosted current-password requirement is not enabled.
        const { data: verified, error: verificationError } = await supabase.auth.signInWithPassword({ email: data.user.email, password: currentPassword });
        if (verificationError || verified.user?.id !== data.user.id) return { error: "Current password is incorrect." };
        const { error } = await supabase.auth.updateUser({ password, current_password: currentPassword });
        return error ? { error: error.message } : {};
      },
    };
  }

  if (!ready) return null;
  return <iframe key={frameKey} className="imported-app" title="PokéAyman" src="/pokeayman/index.html?v=20261023-classic-boxes-v1" allowFullScreen onLoad={(event) => {
    event.currentTarget.contentDocument?.documentElement.style.setProperty("--home-habitat-image", `url("${new URL(homeHabitat, window.location.href).href}")`);
  }} />;
}
