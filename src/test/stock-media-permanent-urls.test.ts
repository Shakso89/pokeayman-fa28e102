import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { searchStockMedia } from "../lib/stock-media";

describe("Permanent Stock Media & Expired Link Prevention", () => {
  const htmlPath = path.resolve(__dirname, "../../public/pokeayman/index.html");
  const html = fs.readFileSync(htmlPath, "utf8");

  it("stock-media discards temporary Pixabay /get/ URLs", async () => {
    const res = await searchStockMedia("test-query", "photo");
    for (const photo of res.photos) {
      expect(photo.src.large).not.toContain("pixabay.com/get/");
      expect(photo.src.medium).not.toContain("pixabay.com/get/");
      expect(photo.src.tiny).not.toContain("pixabay.com/get/");
    }
  });

  it("index.html client-side normalizePixabaySrc excludes /get/ URLs", () => {
    expect(html).toContain("!preview.includes('pixabay.com/get/')");
    expect(html).toContain("!String(p.src.medium || '').includes('pixabay.com/get/')");
  });

  it("index.html includes Wikimedia Commons fallback in pexelsFetch", () => {
    expect(html).toContain("https://commons.wikimedia.org/w/api.php");
    expect(html).toContain("Wikimedia Commons");
  });

  it("index.html includes autoPersistHealedVocabImage and heals broken /get/ images to permanent links", () => {
    expect(html).toContain("window.autoPersistHealedVocabImage = function");
    expect(html).toContain("ve-heal-all-btn");
    expect(html).toContain("have expired Pixabay image links");
  });

  it("Set List Cover and Edit Word modals include onerror healing on images", () => {
    expect(html).toContain('vocab-cover-results');
    expect(html).toContain('window.healBrokenVocabImgElement&&window.healBrokenVocabImgElement(this,this.alt,false)');
  });

  it("Fix Expired Images persists via window.dataSdk.update and updates allData and parent embedded words", () => {
    expect(html).toContain("window.dataSdk?.update");
    expect(html).not.toContain("window.supabaseClient.from('vocab_words')");
    expect(html).not.toContain("window.supabaseClient.from('vocab_lists')");
  });
});
