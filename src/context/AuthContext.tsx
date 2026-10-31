import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthCaches = () => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem("pokeayman-enter-teacher");
      sessionStorage.removeItem("pokeayman-login-session-id");
      sessionStorage.removeItem("pokeayman-streak-dismissed-session");
      sessionStorage.removeItem("pokeayman-streak-dismissed");
      const transientKey = /(^|:)(auth|session|current|selected|last[-_]?used|return|route|restore|restoration|teacher)(:|$)/i;
      Object.keys(localStorage).filter((k) => transientKey.test(k)).forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
  };

  const redirectToLanding = () => {
    if (typeof window === "undefined") return;
    if (window.top && window.top !== window) {
      try {
        window.top.location.replace("/");
        return;
      } catch (_) {}
    }
    window.location.replace("/");
  };

  const signOut = async () => {
    try {
      clearAuthCaches();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setUser(null);
      setSession(null);
      redirectToLanding();
    }
  };

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.warn("Auth getSession error:", err);
      setLoading(false);
    });

    // 2. Real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session ?? null);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_OUT") {
          clearAuthCaches();
          redirectToLanding();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Prevent rendering any route (including landing page) while verifying auth token:
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b1120] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400 animate-pulse">Loading classes...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
