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

  const isDesktop = typeof navigator !== 'undefined' && (
    navigator.userAgent.includes('PokeAymanApp') ||
    Boolean((window as any).pokeaymanDesktop) ||
    new URLSearchParams(window.location.search).get('platform') === 'desktop'
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isDesktop) return;
    const bridge = (window as any).pokeaymanDesktop || (window.top as any)?.pokeaymanDesktop;
    if (bridge?.isFullscreen) {
      bridge.isFullscreen().then((fs: boolean) => setIsFullscreen(Boolean(fs))).catch(() => {});
    }
    if (bridge?.isMaximized) {
      bridge.isMaximized().then((max: boolean) => setIsMaximized(Boolean(max))).catch(() => {});
    }
    bridge?.onFullscreenChange?.((fs: boolean) => setIsFullscreen(Boolean(fs)));
    bridge?.onMaximizedChange?.((max: boolean) => setIsMaximized(Boolean(max)));

    const onMsg = (ev: MessageEvent) => {
      if (ev.data?.type === 'pokeayman:fullscreen-status') {
        setIsFullscreen(Boolean(ev.data.isFullscreen));
      } else if (ev.data?.type === 'pokeayman:maximized-status') {
        setIsMaximized(Boolean(ev.data.isMaximized));
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [isDesktop]);

  return (
    <div className="w-full h-screen flex flex-col bg-[#0b1222] overflow-hidden select-none">
      {isDesktop && !isFullscreen && (
        <header
          id="ts-desktop-header-bar"
          className="w-full h-[34px] bg-[#090e1a] border-b border-white/10 flex items-center justify-between text-slate-300 shrink-0 z-50 select-none cursor-default window-drag-region"
          style={{ WebkitAppRegion: 'drag' } as any}
          onDoubleClick={async () => {
            const bridge = (window as any).pokeaymanDesktop || (window.top as any)?.pokeaymanDesktop;
            if (typeof bridge?.toggleMaximize === 'function') {
              const isMax = await bridge.toggleMaximize();
              setIsMaximized(Boolean(isMax));
            }
          }}
        >
          <div
            className="flex items-center gap-2 pl-3 flex-1 h-full cursor-default select-none window-drag-region"
            style={{ WebkitAppRegion: 'drag' } as any}
          >
            <span className="text-amber-400 font-extrabold text-sm pointer-events-none">⚡</span>
            <span className="text-amber-400 font-black text-xs tracking-wider pointer-events-none">PokéAyman</span>
          </div>
          <div
            className="flex items-stretch h-full window-no-drag-region"
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <button
              type="button"
              className="w-11 h-full flex items-center justify-center hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs focus:outline-none window-no-drag-region"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              onPointerDown={(e) => {
                e.stopPropagation();
                const bridge = (window as any).pokeaymanDesktop || (window.top as any)?.pokeaymanDesktop;
                if (typeof bridge?.minimize === 'function') {
                  bridge.minimize();
                }
                try { window.postMessage({ type: 'pokeayman:minimize' }, '*'); } catch (_) {}
              }}
              onClick={(e) => {
                e.stopPropagation();
                const bridge = (window as any).pokeaymanDesktop || (window.top as any)?.pokeaymanDesktop;
                if (typeof bridge?.minimize === 'function') {
                  bridge.minimize();
                }
                try { window.postMessage({ type: 'pokeayman:minimize' }, '*'); } catch (_) {}
              }}
              title="Minimize"
              aria-label="Minimize"
            >
              ─
            </button>
            <button
              type="button"
              className="w-11 h-full flex items-center justify-center hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-mono focus:outline-none window-no-drag-region"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              onPointerDown={async (e) => {
                e.stopPropagation();
                const bridge = (window as any).pokeaymanDesktop || (window.top as any)?.pokeaymanDesktop;
                if (typeof bridge?.toggleMaximize === 'function') {
                  const isMax = await bridge.toggleMaximize();
                  setIsMaximized(Boolean(isMax));
                } else if (typeof bridge?.toggleFullscreen === 'function') {
                  const fs = await bridge.toggleFullscreen();
                  setIsFullscreen(Boolean(fs));
                } else {
                  try { window.postMessage({ type: 'pokeayman:toggle-maximize' }, '*'); } catch (_) {}
                }
              }}
              onClick={async (e) => {
                e.stopPropagation();
                const bridge = (window as any).pokeaymanDesktop || (window.top as any)?.pokeaymanDesktop;
                if (typeof bridge?.toggleMaximize === 'function') {
                  const isMax = await bridge.toggleMaximize();
                  setIsMaximized(Boolean(isMax));
                } else if (typeof bridge?.toggleFullscreen === 'function') {
                  const fs = await bridge.toggleFullscreen();
                  setIsFullscreen(Boolean(fs));
                } else {
                  try { window.postMessage({ type: 'pokeayman:toggle-maximize' }, '*'); } catch (_) {}
                }
              }}
              title="Maximize or Restore"
              aria-label="Maximize or Restore"
            >
              {isMaximized ? '🗗' : '🗖'}
            </button>
            <button
              type="button"
              className="w-11 h-full flex items-center justify-center hover:bg-[#e81123] text-slate-300 hover:text-white transition-colors cursor-pointer text-xs focus:outline-none window-no-drag-region"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              onPointerDown={(e) => {
                e.stopPropagation();
                const bridge = (window as any).pokeaymanDesktop || (window.top as any)?.pokeaymanDesktop;
                if (typeof bridge?.close === 'function') {
                  bridge.close();
                } else if (typeof bridge?.quitApp === 'function') {
                  bridge.quitApp();
                } else {
                  try { window.postMessage({ type: 'pokeayman:close' }, '*'); } catch (_) {}
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                const bridge = (window as any).pokeaymanDesktop || (window.top as any)?.pokeaymanDesktop;
                if (typeof bridge?.close === 'function') {
                  bridge.close();
                } else if (typeof bridge?.quitApp === 'function') {
                  bridge.quitApp();
                } else {
                  try { window.postMessage({ type: 'pokeayman:close' }, '*'); } catch (_) {}
                }
              }}
              title="Close"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>
      )}
      <iframe
        key={frameKey}
        className="imported-app flex-1 w-full border-0"
        title="PokéAyman"
        src={`/pokeayman/index.html?v=20261106-surprise-boxes-no-repeat-v2&grammar_build=20261115_clean_transparent_v8${isDesktop ? '&platform=desktop' : ''}`}
        allowFullScreen
      />
    </div>
  );
}
