/** Generate non-overlapping letter placements for all theme words on 8x6 grid */

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const ck = (r,c) => `${r},${c}`;

function findPlaceablePath(word, grid, blocked) {
  const rows = grid.length, cols = grid[0].length;
  const target = word.toUpperCase();

  function dfs(row, col, index, path, visited) {
    if (index === target.length) return [...path];
    if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
    const key = ck(row, col);
    if (visited.has(key) || blocked.has(key)) return null;
    const existing = grid[row][col];
    if (existing && existing !== target[index]) return null;

    visited.add(key);
    path.push({ row, col });
    const prev = grid[row][col];
    grid[row][col] = target[index];

    for (const [dr, dc] of DIRS) {
      const result = dfs(row + dr, col + dc, index + 1, path, visited);
      if (result) return result;
    }

    grid[row][col] = prev;
    path.pop();
    visited.delete(key);
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

function generatePuzzle(themeWords, spangram) {
  const rows = 8, cols = 6;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const solutions = {};
  const order = [...themeWords, spangram].sort((a, b) => b.length - a.length);

  for (const word of order) {
    const path = findPlaceablePath(word, grid, new Set());
    if (!path) {
      return { error: `Could not place ${word}` };
    }
    solutions[word] = path;
  }

  const fill = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let fi = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) grid[r][c] = fill[fi++ % fill.length];
    }
  }
  return { grid, solutions };
}

const puzzles = [
  { date: "2025-05-23", number: 810, theme: "Backpacking", spangram: "BACKPACKING", themeWords: ["TENT", "COMPASS", "CANTEEN", "TRAILMAP", "SLEEPING", "STOVE"] },
  { date: "2025-05-24", number: 811, theme: "Staying Alive", spangram: "SURVIVALIST", themeWords: ["MACHETE", "HATCHET", "FLINT", "PARACORD", "TARP", "SHOVEL"] },
  { date: "2025-05-25", number: 812, theme: "Summer Essentials", spangram: "BEACHBAG", themeWords: ["SUNSCREEN", "TOWEL", "FLIPFLOPS", "SUNGLASSES", "COOLER", "UMBRELLA"] },
];

for (const p of puzzles) {
  const result = generatePuzzle(p.themeWords, p.spangram);
  if (result.error) {
    console.log(`#${p.number} FAILED:`, result.error);
    continue;
  }
  console.log(`\n#${p.number} ${p.theme} OK`);
  console.log("grid:", JSON.stringify(result.grid));
  console.log("solutions:", JSON.stringify(result.solutions));
}
