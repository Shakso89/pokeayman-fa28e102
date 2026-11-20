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

  const [isFullscreen, setIsFullscreen] = useState(true);
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

  const isAndroidBrowser = typeof navigator !== 'undefined' &&
    /Android/i.test(navigator.userAgent) &&
    !/wv|PokeAymanApp/i.test(navigator.userAgent) &&
    !(window as any).Capacitor?.isNativePlatform?.();

  useEffect(() => {
    if (isAndroidBrowser && typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('access_token=') || search.includes('code=')) {
        window.location.href = `com.pokeayman.app://classes${search}${hash}`;
      }
    }
  }, [isAndroidBrowser]);

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
          <div className="flex items-center gap-2 pl-3 flex-1 h-full cursor-default select-none pointer-events-none">
            <span className="text-amber-400 font-extrabold text-sm">⚡</span>
            <span className="text-amber-400 font-black text-xs tracking-wider">PokéAyman</span>
          </div>
          <div
            className="flex items-stretch h-full window-no-drag-region"
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <button
              type="button"
              className="w-11 h-full flex items-center justify-center hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs focus:outline-none window-no-drag-region"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              onClick={() => {
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
              onClick={async () => {
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
              onClick={() => {
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
