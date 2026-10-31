import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("OAuth Redirect & Loading Guard Architecture", () => {
  const root = process.cwd();

  it("AuthProvider provides full-screen loading guard while verifying session", () => {
    const authContext = readFileSync(path.join(root, "src", "context", "AuthContext.tsx"), "utf8");
    expect(authContext).toContain("Loading classes...");
    expect(authContext).toContain("animate-spin");
    expect(authContext).toContain("bg-[#0b1120]");
    expect(authContext).toContain("supabase.auth.getSession()");
    expect(authContext).toContain("supabase.auth.onAuthStateChange");
  });

  it("Index route immediately guards authenticated users to /classes without landing page flash", () => {
    const indexRoute = readFileSync(path.join(root, "src", "routes", "index.tsx"), "utf8");
    expect(indexRoute).toContain("useAuth()");
    expect(indexRoute).toContain('<Navigate to="/classes" replace />');
    expect(indexRoute).toContain("Loading classes...");
  });

  it("Classes route guards unauthenticated users to landing route / and mounts workspace directly", () => {
    const classesRoute = readFileSync(path.join(root, "src", "routes", "classes.tsx"), "utf8");
    expect(classesRoute).toContain("createFileRoute(\"/classes\")");
    expect(classesRoute).toContain('<Navigate to="/" replace />');
    expect(classesRoute).toContain("enter=classes");
    expect(classesRoute).toContain("setupPokeaymanBridge");
  });

  it("Post-logout and SIGNED_OUT auth events route directly to the public showcase landing page /", () => {
    const authContext = readFileSync(path.join(root, "src", "context", "AuthContext.tsx"), "utf8");
    expect(authContext).toContain("signOut");
    expect(authContext).toContain('event === "SIGNED_OUT"');
    expect(authContext).toContain('replace("/")');

    const bridge = readFileSync(path.join(root, "src", "lib", "pokeayman-bridge.ts"), "utf8");
    expect(bridge).toContain("signOut: async () =>");
    expect(bridge).toContain('location.replace("/")');

    const indexHtml = readFileSync(path.join(root, "public", "pokeayman", "index.html"), "utf8");
    expect(indexHtml).toContain("logoutTeacherSession");
    expect(indexHtml).toContain("document.documentElement.classList.remove('pokeayman-auto-classes')");
    expect(indexHtml).toContain("location.replace('/')");
  });

  it("Google OAuth login handlers explicitly provide /classes in redirectTo", () => {
    const authRoute = readFileSync(path.join(root, "src", "routes", "auth.tsx"), "utf8");
    expect(authRoute).toContain("redirectTo: redirectToUrl");
    expect(authRoute).toContain("${window.location.origin}/classes");

    const bridge = readFileSync(path.join(root, "src", "lib", "pokeayman-bridge.ts"), "utf8");
    expect(bridge).toContain("redirectTo: redirectToUrl");
    expect(bridge).toContain("${window.location.origin}/classes");
  });

  it("Supabase configuration includes /classes in redirect URLs", () => {
    const config = readFileSync(path.join(root, "supabase", "config.toml"), "utf8");
    expect(config).toContain("https://pokeayman.pokeayman.workers.dev/classes");
  });

  it("Public app avoids 1200ms delay and suppresses landing screen on direct classes entry", () => {
    const indexHtml = readFileSync(path.join(root, "public", "pokeayman", "index.html"), "utf8");
    expect(indexHtml).not.toContain("setTimeout(async () => { const p = await auth.getProfile(); window.pokeaymanEnterTeacher(p.name); }, 1200)");
    expect(indexHtml).toContain("pokeayman-auto-classes");
    expect(indexHtml).toContain("html.pokeayman-auto-classes #home-screen{display:none!important}");
  });
});
