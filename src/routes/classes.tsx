import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { setupPokeaymanBridge } from "@/lib/pokeayman-bridge";

export const Route = createFileRoute("/classes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Classes & Students — PokéAyman" },
      { name: "description", content: "Manage your PokéAyman classes, enrolled students and Pokémon rewards." },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const router = useRouter();
  const queryClient = (router.options.context as any)?.queryClient;
  const { user, loading } = useAuth();
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("pokeayman-enter-teacher", "1");
      } catch (_) {}
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b1120] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400 animate-pulse">Loading classes...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  setupPokeaymanBridge({ user, queryClient });

  return (
    <iframe
      key={frameKey}
      className="imported-app"
      title="PokéAyman Classes"
      src="/pokeayman/index.html?v=20261023-classic-boxes-v1&enter=classes"
      allowFullScreen
    />
  );
}
