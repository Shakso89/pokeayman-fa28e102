import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { setupPokeaymanBridge } from "@/lib/pokeayman-bridge";

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

function Index() {
  const router = useRouter();
  const queryClient = (router.options.context as any)?.queryClient;
  const { user, loading } = useAuth();
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    // If signed out, clean up any teacher session marks
    if (!user) {
      try {
        sessionStorage.removeItem("pokeayman-login-session-id");
        sessionStorage.removeItem("pokeayman-streak-dismissed-session");
        sessionStorage.removeItem("pokeayman-streak-dismissed");
      } catch (_) {}
    }
  }, [user]);

  // Loading gate prevents landing page from flashing while verifying session
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b1120] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400 animate-pulse">Loading classes...</span>
      </div>
    );
  }

  // If user is already authenticated, jump straight to classes without mounting landing page:
  if (user) {
    return <Navigate to="/classes" replace />;
  }

  // Attach bridge for unauthenticated visitors / students
  setupPokeaymanBridge({ user: null, queryClient });

  return (
    <iframe
      key={frameKey}
      className="imported-app"
      title="PokéAyman"
      src="/pokeayman/index.html?v=20261023-classic-boxes-v1"
      allowFullScreen
    />
  );
}
