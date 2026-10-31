import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { streamSpeech } from "@/lib/vocabulary-speech";
import { fetchClassStudents, removeStudentFromClass, adjustStudentCoins } from "@/lib/class-students";
import { useRouter } from "@tanstack/react-router";

type Result = { error?: string; name?: string; signedIn?: boolean };

declare global {
  interface Window {
    supabaseClient?: any;
    queryClient?: any;
    fetchClassStudents?: typeof fetchClassStudents;
    removeStudentFromClass?: typeof removeStudentFromClass;
    adjustStudentCoins?: typeof adjustStudentCoins;
    pokeaymanSpeak?: (text: string, level?: string) => Promise<void>;
    pokeaymanStop?: () => void;
    pokeaymanAuth?: {
      supabase?: unknown;
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
    links: [
      {
        rel: "preload",
        as: "image",
        href: "/pokeayman/assets/home-habitat.webp",
        type: "image/webp",
      },
    ],
  }),
  component: Index,
});

async function profileName(known?: User | null): Promise<string> {
  const u = known ?? (await supabase.auth.getSession()).data.session?.user ?? null;
  if (!u) return "Teacher";
  // Cloud admins enter as the built-in "Ayman" Admin identity, inheriting all its permissions.
  // Role and profile are read in parallel to keep sign-in fast.
  const [{ data: roles }, { data: p }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", u.id),
    supabase.from("profiles").select("display_name").eq("id", u.id).maybeSingle(),
  ]);
  if (roles?.some((r) => r.role === "admin")) return "Ayman";
  const name = p?.display_name || (u.user_metadata?.["display_name"] as string) || (u.user_metadata?.["full_name"] as string) || u.email?.split("@")[0] || "Teacher";
  // Non-admins may not take the reserved Admin name.
  return /^(teacher\s+)?ayman$/i.test(name.trim()) ? `${name.trim()} (Teacher)` : name;
}

let activeSpeechController: AbortController | null = null;

function Index() {
  const router = useRouter();
  const queryClient = (router.options.context as any)?.queryClient;
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); }).catch(() => {}).finally(() => setReady(true));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setUser(session?.user ?? null);
        if (window.pokeaymanAuth && session?.user) {
          window.pokeaymanAuth.userId = session.user.id;
          window.pokeaymanAuth.email = session.user.email ?? null;
        }
      }
      if (event === "SIGNED_OUT") {
        try {
          sessionStorage.removeItem("pokeayman-login-session-id");
          sessionStorage.removeItem("pokeayman-streak-dismissed-session");
          sessionStorage.removeItem("pokeayman-streak-dismissed");
        } catch (_) {}
        setUser(null);
        if (window.pokeaymanAuth) { window.pokeaymanAuth.userId = null; window.pokeaymanAuth.email = null; }
        // Return the existing app to its home screen instead of reloading it (much faster).
        try {
          const frame = document.querySelector<HTMLIFrameElement>("iframe.imported-app");
          const w = frame?.contentWindow as (Window & { logoutTeacherSession?: () => void }) | null;
          if (w?.logoutTeacherSession) w.logoutTeacherSession(); else setFrameKey((k) => k + 1);
        } catch (_) { setFrameKey((k) => k + 1); }
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
    window.supabaseClient = supabase;
    window.queryClient = queryClient;
    window.fetchClassStudents = fetchClassStudents;
    window.removeStudentFromClass = removeStudentFromClass;
    window.adjustStudentCoins = adjustStudentCoins;
    (window as any).pokeaymanSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czszbdkdvvxeqkublkgi.supabase.co';
    (window as any).pokeaymanSupabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
    window.pokeaymanAuth = {
      supabase,
      userId: user?.id ?? null,
      getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
      getProfile: async () => ({ name: await profileName() }),
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) return { error: error.message.includes("confirm") ? "Please confirm your email first (check your inbox)." : "Wrong email or password." };
        if (window.pokeaymanAuth) { window.pokeaymanAuth.userId = data.user?.id ?? null; window.pokeaymanAuth.email = data.user?.email ?? null; }
        return { name: await profileName(data.user) };
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
        if (r.error) {
          const m = String((r.error as Error)?.message ?? r.error);
          if (/blocked/i.test(m)) return { error: "Your browser blocked the Google window. Allow pop-ups for this site, then try again." };
          if (/cancel/i.test(m)) return { error: "The Google window was closed before signing in. Please try again." };
          if (/preview mode|new tab/i.test(m)) return { error: "Google sign-in doesn't work in this preview. Open the app in a new tab to sign in." };
          if (/provider|not enabled/i.test(m)) return { error: "Google sign-in isn't switched on yet. Please use email and password for now." };
          return { error: `Google sign-in failed: ${m}` };
        }
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
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) return { error: "Not signed in" };
        const trimmedName = name.trim().slice(0, 80);
        const trimmedSchool = school.trim().slice(0, 120) || null;
        const { error } = await supabase.from("profiles").upsert({
          id: data.user.id,
          display_name: trimmedName,
          school: trimmedSchool,
        });
        if (error) return { error: error.message };
        try {
          await supabase.auth.updateUser({
            data: {
              display_name: trimmedName,
              school: trimmedSchool,
              full_name: trimmedName,
            },
          });
        } catch (_) {}
        const finalName = await profileName();
        return { name: finalName, school: trimmedSchool };
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

  void ready;
  return <iframe key={frameKey} className="imported-app" title="PokéAyman" src="/pokeayman/index.html?v=20261023-classic-boxes-v1" allowFullScreen />;
}
