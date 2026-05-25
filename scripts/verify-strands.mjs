import { STRANDS_PUZZLES } from "../lib/strandsData.ts";

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
function cellKey(r,c){return `${r},${c}`;}

function findPathForWord(grid, word, blocked = new Set()) {
  const rows = grid.length, cols = grid[0].length;
  const target = word.toUpperCase();
  function dfs(row, col, index, path, visited) {
    if (index === target.length) return [...path];
    if (row<0||col<0||row>=rows||col>=cols||visited.has(cellKey(row,col))||blocked.has(cellKey(row,col))) return null;
    if (grid[row][col].toUpperCase() !== target[index]) return null;
    visited.add(cellKey(row,col));
    path.push({row,col});
    for (const [dr,dc] of DIRS) {
      const r = dfs(row+dr,col+dc,index+1,path,visited);
      if (r) return r;
    }
    path.pop();
    visited.delete(cellKey(row,col));
    return null;
  }
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    const r2 = dfs(r,c,0,[],new Set());
    if (r2) return r2;
  }
  return null;
}

for (const p of STRANDS_PUZZLES) {
  console.log(`\n#${p.number} ${p.theme}`);
  for (const w of [...p.themeWords, p.spangram]) {
    const path = findPathForWord(p.grid, w);
    console.log(`  ${w}: ${path ? "OK" : "MISSING"}`);
  }
}
