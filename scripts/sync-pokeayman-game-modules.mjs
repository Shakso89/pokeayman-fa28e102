import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacyDir = path.join(root, "public", "pokeayman");
const htmlPath = path.join(legacyDir, "index.html");
let html = await readFile(htmlPath, "utf8");

const modules = ["games-arcade", "listen-catch", "crossword"];
for (const name of modules) {
  const marker = `data-pokeayman-inline="${name}"`;
  const startTag = `<script ${marker}>`;
  const endTag = "</script>";
  const source = (await readFile(path.join(legacyDir, `${name}.js`), "utf8"))
    .replace(/<\/script/gi, "<\\/script");
  const start = html.indexOf(startTag);

  if (start >= 0) {
    const end = html.indexOf(endTag, start + startTag.length);
    if (end < 0) throw new Error(`Missing closing script tag for ${name}`);
    const next = end + endTag.length;
    html = `${html.slice(0, start)}${startTag}\n${source}\n${endTag}${html.slice(next)}`;
    continue;
  }

  const externalTag = `<script src="/pokeayman/${name}.js"></script>`;
  if (!html.includes(externalTag)) throw new Error(`Could not find ${externalTag} in index.html`);
  html = html.replace(externalTag, () => `${startTag}\n${source}\n${endTag}`);
}

await writeFile(htmlPath, html);
