import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wordsPath = path.join(__dirname, "../public/words_alpha.txt");
const outPath = path.join(__dirname, "../public/spelling-bee-by-letters.json");

const PUZZLES = [
  { center: "T", outer: ["A", "N", "G", "E", "R", "S"] },
  { center: "L", outer: ["A", "P", "E", "C", "O", "R"] },
  { center: "I", outer: ["M", "P", "A", "R", "T", "S"] },
];

function signature(center, outer) {
  return [center, ...outer].sort().join("");
}

function filterWords(center, outer, allWords) {
  const allowed = new Set([center, ...outer].map((l) => l.toUpperCase()));
  const c = center.toUpperCase();
  const result = [];
  for (const raw of allWords) {
    const w = raw.trim().toUpperCase();
    if (w.length < 4 || w.length > 14) continue;
    if (!/^[A-Z]+$/.test(w)) continue;
    if (!w.includes(c)) continue;
    let ok = true;
    for (const ch of w) {
      if (!allowed.has(ch)) {
        ok = false;
        break;
      }
    }
    if (ok) result.push(w);
  }
  return [...new Set(result)].sort();
}

const text = fs.readFileSync(wordsPath, "utf8");
const allWords = text.split(/\r?\n/);
const cache = {};

for (const p of PUZZLES) {
  const key = signature(p.center, p.outer);
  cache[key] = filterWords(p.center, p.outer, allWords);
  console.log(key, cache[key].length, "words");
}

fs.writeFileSync(outPath, JSON.stringify(cache));
console.log("Wrote", outPath);
