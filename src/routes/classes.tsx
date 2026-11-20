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

        // If loaded in external Android Chrome after Google OAuth redirect, auto-handoff back into PokéAyman APK
        const isAndroidBrowser = /Android/i.test(navigator.userAgent) &&
          !/wv|PokeAymanApp/i.test(navigator.userAgent) &&
          !(window as any).Capacitor?.isNativePlatform?.();

        if (isAndroidBrowser && (window.location.hash.includes("access_token") || sessionStorage.getItem("pokeayman-oauth-in-progress"))) {
          sessionStorage.removeItem("pokeayman-oauth-in-progress");
          window.location.href = "com.pokeayman.app://classes" + window.location.hash;
        }
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
    return <Navigate to="/" replace />;
  }

  setupPokeaymanBridge({ user, queryClient });

  const isDesktop = typeof navigator !== 'undefined' && (
    navigator.userAgent.includes('PokeAymanApp') ||
    Boolean((window as any).pokeaymanDesktop) ||
    new URLSearchParams(window.location.search).get('platform') === 'desktop'
  );
  const iframeSrc = `/pokeayman/index.html?v=20261106-surprise-boxes-no-repeat-v2&grammar_build=20261115_clean_transparent_v8&enter=classes${isDesktop ? '&platform=desktop' : ''}`;

  const isAndroidBrowser = typeof navigator !== 'undefined' &&
    /Android/i.test(navigator.userAgent) &&
    !/wv|PokeAymanApp/i.test(navigator.userAgent) &&
    !(window as any).Capacitor?.isNativePlatform?.();

  return (
    <div className="w-full h-screen flex flex-col">
      {isAndroidBrowser && (
        <aside className="w-full bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-between shadow-md z-50 shrink-0">
          <span>📱 PokéAyman App installed?</span>
          <a
            href={`com.pokeayman.app://classes${typeof window !== 'undefined' ? window.location.hash : ''}`}
            className="bg-slate-950 text-amber-300 px-3 py-1 rounded-md text-xs font-black shadow hover:bg-slate-900"
          >
            Open in PokéAyman App
          </a>
        </aside>
      )}
      <iframe
        key={frameKey}
        className="imported-app flex-1 w-full border-none"
        title="PokéAyman Classes"
        src={iframeSrc}
        allowFullScreen
      />
    </div>
  );
}
