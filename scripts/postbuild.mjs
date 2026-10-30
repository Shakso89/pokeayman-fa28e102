import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const wranglerPath = resolve(process.cwd(), ".output/server/wrangler.json");
try {
  const content = JSON.parse(readFileSync(wranglerPath, "utf8"));
  content.compatibility_date = "2024-11-01";
  
  // Read local key or fallback safely
  let geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) {
    try {
      const envLocal = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
      const m = envLocal.match(/GEMINI_API_KEY="([^"]+)"/);
      if (m) geminiKey = m[1];
    } catch {}
  }
  if (!geminiKey) {
    geminiKey = Buffer.from("QVEuQWI4Uk42S3hqMnNyRVI4YmhkeVlKR190WUEyZ1A5YVFKckZBQ0NTYU83dmNqZHRXRnc=", "base64").toString("utf8");
  }

  content.vars = {
    GEMINI_API_KEY: geminiKey,
    GOOGLE_API_KEY: geminiKey,
    PIXABAY_API_KEY: "58123311-8a89c5e2df18a2650add733fa",
    SUPABASE_URL: "https://czszbdkdvvxeqkublkgi.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3piZGtkdnZ4ZXFrdWJsa2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MjkyODEsImV4cCI6MjEwMzQwNTI4MX0.fupuvKLgaRKlR7oW-ps79ce-Uq6iVuHfBoe_MkY86vo",
    SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3piZGtkdnZ4ZXFrdWJsa2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgyOTI4MSwiZXhwIjoyMTAzNDA1MjgxfQ.Olum5yB0km3-9iOtnitZ9IH5-HM9JgFAQ6ayspcEIr0"
  };
  writeFileSync(wranglerPath, JSON.stringify(content, null, 2), "utf8");
  console.log("Updated .output/server/wrangler.json with vars and compatibility_date: 2024-11-01");
} catch (e) {
  console.warn("Could not patch wrangler.json:", e.message);
}
