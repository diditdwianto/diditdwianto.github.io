// Builds the static guest page into ../dinner/ (GitHub Pages serves it at https://diditdwianto.github.io/dinner/).
import { build } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "../dinner";
const v = Date.now().toString(36);
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/worklets`, { recursive: true });
await build({ entryPoints: ["src/main.js"], bundle: true, format: "esm", target: "es2020", minify: true, outfile: `${out}/app.js`, loader: { ".json": "json" } });
// The SDK loads its audio worklets next to the bundle (new URL("./worklets/…", import.meta.url)).
for (const f of ["microphone.js", "playback.js"]) cpSync(`node_modules/@wonderful/web/voice/worklets/${f}`, `${out}/worklets/${f}`);
cpSync("src/style.css", `${out}/style.css`);
cpSync("src/orb/all-blue.webp", `${out}/orb.webp`);
cpSync("src/brand/wonderful-wordmark.png", `${out}/wordmark.png`);
writeFileSync(`${out}/index.html`, readFileSync("src/index.html", "utf8").replaceAll("__V__", v));
// Talk mode fallback (hands-free | hold), used only when the App's dd-talk function does not answer.
cpSync("src/mode.json", `${out}/mode.json`);
console.log(`built ${out}/ (v ${v})`);
