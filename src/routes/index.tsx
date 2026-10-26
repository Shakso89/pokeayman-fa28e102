import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { streamSpeech } from "@/lib/vocabulary-speech";

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
    window.pokeaymanAuth = {
      userId: user?.id ?? null,
      getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
      getProfile: async () => ({ name: await profileName() }),
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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

  if (!ready) return (
    <div className="session-restore-overlay" role="status" aria-live="polite">
      <style>{`
        .session-restore-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 50% 42%,rgba(18,37,76,.82),rgba(5,10,23,.97) 68%),linear-gradient(rgba(4,9,22,.84),rgba(4,9,22,.93));color:#f8fafc}
        .session-restore-card{width:min(100%,380px);display:grid;justify-items:center;gap:12px;padding:34px 28px 30px;text-align:center;border:1px solid rgba(255,203,5,.22);border-radius:26px;background:linear-gradient(155deg,rgba(19,30,55,.9),rgba(9,15,30,.92));box-shadow:0 28px 80px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.08);backdrop-filter:blur(12px)}
        .session-restore-ball{position:relative;display:grid;place-items:center;width:66px;height:66px;margin-bottom:3px;border:4px solid rgba(255,255,255,.9);border-radius:50%;background:linear-gradient(to bottom,#ee4149 0 45%,#121725 45% 55%,#f8fafc 55% 100%);box-shadow:0 0 0 5px rgba(255,203,5,.1),0 0 32px rgba(255,203,5,.2);animation:session-restore-bob 1.6s ease-in-out infinite}
        .session-restore-ball:after{content:'';position:absolute;left:50%;top:50%;width:19px;height:19px;transform:translate(-50%,-50%);border:4px solid #121725;border-radius:50%;background:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.86)}
        .session-restore-kicker{margin:3px 0 0;color:#ffcb05;font:800 10px/1.2 system-ui,sans-serif;letter-spacing:.2em}
        .session-restore-card h1{margin:0;color:#f8fafc;font:800 clamp(21px,5vw,27px)/1.15 system-ui,sans-serif}
        .session-restore-copy{margin:0;color:#aebbd3;font:500 14px/1.5 system-ui,sans-serif}
        .session-restore-progress{width:min(100%,240px);height:4px;margin-top:9px;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.1)}
        .session-restore-progress i{display:block;width:38%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#ffcb05,#ffeb83);box-shadow:0 0 14px rgba(255,203,5,.65);animation:session-restore-progress 1.25s ease-in-out infinite}
        @keyframes session-restore-bob{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-5px) rotate(5deg)}}
        @keyframes session-restore-progress{from{transform:translateX(-110%)}to{transform:translateX(270%)}}
        @media(prefers-reduced-motion:reduce){.session-restore-ball,.session-restore-progress i{animation:none}}
      `}</style>
      <section className="session-restore-card">
        <span className="session-restore-ball" aria-hidden="true" />
        <p className="session-restore-kicker">TEACHER PORTAL</p>
        <h1>Getting your classroom ready</h1>
        <p className="session-restore-copy">Restoring your sign-in and preparing your dashboard.</p>
        <span className="session-restore-progress" aria-hidden="true"><i /></span>
      </section>
    </div>
  );
  return <iframe key={frameKey} className="imported-app" title="PokéAyman" src="/pokeayman/index.html?v=20261023-classic-boxes-v1" allowFullScreen />;
}
