/** Regenerate strands solution paths from grid letters */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function cellKey(r, c) {
  return `${r},${c}`;
}

function findPathForWord(grid, word) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const target = word.toUpperCase();

  function dfs(row, col, index, path, visited) {
    if (index === target.length) return [...path];
    if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
    if (visited.has(cellKey(row, col))) return null;
    if (grid[row][col].toUpperCase() !== target[index]) return null;

    visited.add(cellKey(row, col));
    path.push({ row, col });

    for (const [dr, dc] of DIRS) {
      const result = dfs(row + dr, col + dc, index + 1, path, visited);
      if (result) return result;
    }

    path.pop();
    visited.delete(cellKey(row, col));
    return null;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const result = dfs(r, c, 0, [], new Set());
      if (result) return result;
    }
  }
  return null;
}

// Inline puzzle data (copy from strandsData.ts)
const puzzles = [
  {
    date: "2025-05-25",
    spangram: "BEACHBAG",
    themeWords: ["SUNSCREEN", "TOWEL", "FLIPFLOPS", "SUNGLASSES", "COOLER", "UMBRELLA"],
    grid: [
      ["S", "U", "N", "G", "L", "A"],
      ["C", "S", "E", "S", "S", "F"],
      ["R", "E", "N", "I", "L", "U"],
      ["L", "F", "P", "B", "M", "L"],
      ["O", "P", "S", "R", "E", "L"],
      ["B", "H", "C", "A", "A", "E"],
      ["A", "G", "O", "O", "L", "R"],
      ["T", "O", "W", "E", "A", "B"],
    ],
  },
  {
    date: "2025-05-24",
    spangram: "SURVIVALIST",
    themeWords: ["MACHETE", "HATCHET", "FLINT", "PARACORD", "TARP", "SHOVEL"],
    grid: [
      ["S", "U", "R", "V", "I", "V"],
      ["T", "S", "I", "L", "A", "P"],
      ["O", "C", "A", "R", "M", "C"],
      ["R", "D", "T", "E", "H", "A"],
      ["S", "E", "H", "C", "T", "F"],
      ["H", "O", "V", "E", "L", "I"],
      ["T", "A", "R", "T", "N", "A"],
      ["B", "P", "C", "D", "E", "F"],
    ],
  },
  {
    date: "2025-05-23",
    spangram: "BACKPACKING",
    themeWords: ["TENT", "COMPASS", "CANTEEN", "TRAILMAP", "SLEEPING", "STOVE"],
    grid: [
      ["B", "A", "C", "K", "P", "A"],
      ["G", "N", "I", "K", "C", "T"],
      ["M", "L", "S", "A", "R", "I"],
      ["A", "P", "E", "E", "P", "N"],
      ["C", "O", "M", "P", "G", "C"],
      ["S", "S", "A", "N", "A", "E"],
      ["E", "E", "T", "O", "V", "A"],
      ["N", "T", "B", "C", "D", "E"],
    ],
  },
];

for (const p of puzzles) {
  console.log("\n===", p.date, "===");
  const all = [...p.themeWords, p.spangram];
  for (const word of all) {
    const path = findPathForWord(p.grid, word);
    if (!path) {
      console.error("MISSING PATH:", word);
    } else {
      const spelled = path.map(({ row, col }) => p.grid[row][col]).join("");
      const ok = spelled.toUpperCase() === word.toUpperCase();
      console.log(word, ok ? "OK" : `SPELLS ${spelled}`, "len", path.length);
    }
  }
}
