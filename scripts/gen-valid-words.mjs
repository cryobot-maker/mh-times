import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, "../lib/wordleData.ts"), "utf8");
const words = [...src.matchAll(/"([A-Z]{5})"/g)].map((m) => m[1]);
const unique = [...new Set(words)];
const out = path.join(__dirname, "../public/valid-words.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(unique));
console.log(`Wrote ${unique.length} words`);
