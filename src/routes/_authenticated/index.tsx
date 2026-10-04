import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    pokeaymanAuth?: { getToken: () => Promise<string | null>; userId: string };
  }
}

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "PokéAyman" },
      { name: "description", content: "PokéAyman's Pokémon-inspired classroom app for teachers and students." },
      { property: "og:title", content: "PokéAyman" },
      { property: "og:description", content: "PokéAyman's Pokémon-inspired classroom app for teachers and students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Expose the teacher's session to the same-origin PokéAyman iframe so its saves are scoped to this teacher.
  if (typeof window !== "undefined") {
    window.pokeaymanAuth = {
      userId: user.id,
      getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
    };
  }
  useEffect(() => () => { delete window.pokeaymanAuth; }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <>
      <iframe key={user.id} className="imported-app" title="PokéAyman" src="/pokeayman/index.html" />
      <button
        onClick={signOut}
        title={`Sign out (${user.email ?? "teacher"})`}
        className="fixed bottom-3 left-3 z-50 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur hover:bg-accent"
      >
        <LogOut className="h-3.5 w-3.5" /> Sign out
      </button>
    </>
  );
}
