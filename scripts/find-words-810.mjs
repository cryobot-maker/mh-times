import { STRANDS_PUZZLES } from "../lib/strandsData.ts";

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const ck = (r,c) => `${r},${c}`;

function findPathForWord(grid, word) {
  const rows = grid.length, cols = grid[0].length, target = word.toUpperCase();
  function dfs(row, col, index, path, visited) {
    if (index === target.length) return [...path];
    if (row < 0 || col < 0 || row >= rows || col >= cols || visited.has(ck(row,col))) return null;
    if (grid[row][col].toUpperCase() !== target[index]) return null;
    visited.add(ck(row,col));
    path.push({ row, col });
    for (const [dr, dc] of DIRS) {
      const r = dfs(row + dr, col + dc, index + 1, path, visited);
      if (r) return r;
    }
    path.pop();
    visited.delete(ck(row,col));
    return null;
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const r2 = dfs(r, c, 0, [], new Set());
    if (r2) return r2;
  }
  return null;
}

const p810 = STRANDS_PUZZLES.find(p => p.number === 810);
const words = [...p810.themeWords, p810.spangram];
const solutions = {};
for (const w of words) {
  const path = findPathForWord(p810.grid, w);
  console.log(w, path ? JSON.stringify(path) : "MISSING");
  if (path) solutions[w] = path;
}
