import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { streamSpeech } from "@/lib/vocabulary-speech";
import {
  fetchClassStudents,
  removeStudentFromClass,
  adjustStudentCoins,
  fetchClassActiveGameVocabListIds,
  updateClassActiveGameVocabListIds,
  fetchStudentEnrolledClasses,
} from "@/lib/class-students";

export type Result = { error?: string; name?: string; signedIn?: boolean };

export async function profileName(known?: User | null): Promise<string> {
  const u = known ?? (await supabase.auth.getSession()).data.session?.user ?? null;
  if (!u) return "Teacher";
  const [{ data: roles }, { data: p }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", u.id),
    supabase.from("profiles").select("display_name").eq("id", u.id).maybeSingle(),
  ]);
  if (roles?.some((r) => r.role === "admin")) return "Ayman";
  const name =
    p?.display_name ||
    (u.user_metadata?.["display_name"] as string) ||
    (u.user_metadata?.["full_name"] as string) ||
    u.email?.split("@")[0] ||
    "Teacher";
  return /^(teacher\s+)?ayman$/i.test(name.trim()) ? `${name.trim()} (Teacher)` : name;
}

let activeSpeechController: AbortController | null = null;

export function setupPokeaymanBridge({
  user,
  queryClient,
}: {
  user: User | null;
  queryClient: any;
}) {
  if (typeof window === "undefined") return;

  window.pokeaymanStop = () => {
    if (activeSpeechController) {
      activeSpeechController.abort();
      activeSpeechController = null;
    }
  };

  window.pokeaymanSpeak = (text: string, level = "P3") => {
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
  (window as any).fetchClassActiveGameVocabListIds = fetchClassActiveGameVocabListIds;
  (window as any).updateClassActiveGameVocabListIds = updateClassActiveGameVocabListIds;
  (window as any).fetchStudentEnrolledClasses = fetchStudentEnrolledClasses;
  (window as any).pokeaymanSupabaseUrl =
    import.meta.env.VITE_SUPABASE_URL || "https://czszbdkdvvxeqkublkgi.supabase.co";
  (window as any).pokeaymanSupabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

  window.pokeaymanAuth = {
    supabase,
    userId: user?.id ?? null,
    getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
    getProfile: async () => ({ name: await profileName() }),
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error)
        return {
          error: error.message.includes("confirm")
            ? "Please confirm your email first (check your inbox)."
            : "Wrong email or password.",
        };
      if (window.pokeaymanAuth) {
        window.pokeaymanAuth.userId = data.user?.id ?? null;
        window.pokeaymanAuth.email = data.user?.email ?? null;
      }
      return { name: await profileName(data.user) };
    },
    signUp: async (email, password, name, school) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/classes`,
          data: { display_name: name, school },
        },
      });
      if (error) return { error: error.message };
      return { signedIn: !!data.session };
    },
    signInWithGoogle: async () => {
      const redirectToUrl = `${window.location.origin}/classes`;
      try {
        sessionStorage.setItem("pokeayman-enter-teacher", "1");
      } catch (_) {}
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectToUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        console.error("Google Sign-In Error:", error.message);
        const m = error.message;
        if (/blocked/i.test(m))
          return { error: "Your browser blocked the Google window. Allow pop-ups for this site, then try again." };
        if (/cancel/i.test(m))
          return { error: "The Google window was closed before signing in. Please try again." };
        if (/preview mode|new tab/i.test(m))
          return { error: "Google sign-in doesn't work in this preview. Open the app in a new tab to sign in." };
        if (/provider|not enabled/i.test(m))
          return { error: "Google sign-in isn't switched on yet. Please use email and password for now." };
        return { error: `Google sign-in failed: ${m}` };
      }
      if (data?.url && typeof window !== "undefined") {
        window.location.href = data.url;
        return {};
      }
      return { name: await profileName() };
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return error ? { error: error.message } : {};
    },
    signOut: async () => {
      try {
        sessionStorage.removeItem("pokeayman-enter-teacher");
        sessionStorage.removeItem("pokeayman-login-session-id");
        sessionStorage.removeItem("pokeayman-streak-dismissed-session");
        sessionStorage.removeItem("pokeayman-streak-dismissed");
        const transientKey = /(^|:)(auth|session|current|selected|last[-_]?used|return|route|restore|restoration|teacher)(:|$)/i;
        Object.keys(localStorage).filter((k) => transientKey.test(k)).forEach((k) => localStorage.removeItem(k));
      } catch (_) {}
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Sign out error:", err);
      } finally {
        if (typeof window !== "undefined") {
          if (window.top && window.top !== window) {
            try {
              window.top.location.replace("/");
              return;
            } catch (_) {}
          }
          window.location.replace("/");
        }
      }
    },
    email: user?.email ?? null,
    getAccount: async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return null;
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, school")
        .eq("id", u.id)
        .maybeSingle();
      return {
        email: u.email ?? "",
        displayName: p?.display_name ?? "",
        school: p?.school ?? "",
      };
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
      if (!currentPassword || currentPassword.length > 1024)
        return { error: "Enter your current password." };
      if (password.length < 8 || password.length > 1024)
        return { error: "New password must be between 8 and 1024 characters." };
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data.user?.email)
        return { error: "Sign in again to change your password." };
      const { data: verified, error: verificationError } =
        await supabase.auth.signInWithPassword({
          email: data.user.email,
          password: currentPassword,
        });
      if (verificationError || verified.user?.id !== data.user.id)
        return { error: "Current password is incorrect." };
      const { error } = await supabase.auth.updateUser({
        password,
        current_password: currentPassword,
      });
      return error ? { error: error.message } : {};
    },
  };
}
