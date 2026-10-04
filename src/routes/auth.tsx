import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Teacher sign in — PokéAyman" },
      { name: "description", content: "Sign in to PokéAyman to manage your classes, students and Pokémon rewards." },
      { property: "og:title", content: "Teacher sign in — PokéAyman" },
      { property: "og:description", content: "Sign in to PokéAyman to manage your classes, students and Pokémon rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/", replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => { if (session) navigate({ to: "/", replace: true }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name, school } },
        });
        if (error) throw error;
        if (!data.session) setMsg({ ok: true, text: "Check your email to confirm your account, then sign in." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMsg({ ok: true, text: "Password reset link sent — check your email." });
      }
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong" });
    } finally { setBusy(false); }
  }

  async function google() {
    setMsg(null);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res?.error) setMsg({ ok: false, text: String(res.error.message ?? res.error) });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h1 className="text-2xl font-black tracking-tight text-foreground">PokéAyman</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup" ? "Create your teacher account" : mode === "reset" ? "Reset your password" : "Teacher sign in"}
        </p>

        {mode !== "reset" && (
          <>
            <Button type="button" variant="outline" className="mt-5 w-full" onClick={google}>Continue with Google</Button>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          </>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <div className="space-y-1"><Label htmlFor="name">Your name</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="school">School</Label><Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} /></div>
            </>
          )}
          <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {mode !== "reset" && (
            <div className="space-y-1"><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          )}
          {msg && <p className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-1 text-center text-sm">
          {mode === "signin" && (
            <>
              <button className="text-primary hover:underline" onClick={() => setMode("signup")}>New teacher? Create an account</button>
              <button className="text-muted-foreground hover:underline" onClick={() => setMode("reset")}>Forgot password?</button>
            </>
          )}
          {mode !== "signin" && <button className="text-primary hover:underline" onClick={() => setMode("signin")}>Back to sign in</button>}
        </div>
      </div>
    </main>
  );
}
