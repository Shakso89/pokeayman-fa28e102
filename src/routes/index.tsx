import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    pokeaymanAuth?: { getToken: () => Promise<string | null>; userId: string | null; signIn: () => void };
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

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // The same-origin PokéAyman iframe reads this to attach the teacher's token to saves.
  if (typeof window !== "undefined") {
    window.pokeaymanAuth = {
      userId: user?.id ?? null,
      getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
      signIn: () => { window.location.href = "/auth"; },
    };
  }

  if (!ready) return null;
  return (
    <>
      <iframe key={user?.id ?? "guest"} className="imported-app" title="PokéAyman" src="/pokeayman/index.html" />
      {user && (
        <button
          onClick={() => supabase.auth.signOut()}
          title={`Sign out (${user.email ?? "teacher"})`}
          className="fixed bottom-3 left-3 z-50 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur hover:bg-accent"
        >
          <LogOut className="h-3.5 w-3.5" /> Teacher sign out
        </button>
      )}
    </>
  );
}
