const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const ck = (r,c) => `${r},${c}`;
const p = (row,col) => ({row,col});

function isAdjacent(a, b) {
  return Math.abs(a.row - b.row) <= 1 && Math.abs(a.col - b.col) <= 1 && !(a.row === b.row && a.col === b.col);
}

function validatePath(word, path) {
  if (path.length !== word.length) throw new Error(`${word}: path len ${path.length} != word ${word.length}`);
  for (let i = 1; i < path.length; i++) {
    if (!isAdjacent(path[i - 1], path[i])) throw new Error(`${word}: not adjacent at ${i}`);
  }
}

function buildGrid(rows, cols, solutions) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(""));
  let fi = 0;
  const fill = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const [word, path] of Object.entries(solutions)) {
    validatePath(word, path);
    [...word].forEach((ch, i) => {
      const { row, col } = path[i];
      if (grid[row][col] && grid[row][col] !== ch) {
        throw new Error(`Conflict ${row},${col}: ${grid[row][col]} vs ${ch} (${word})`);
      }
      grid[row][col] = ch;
    });
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!grid[r][c]) grid[r][c] = fill[fi++ % fill.length];
  }
  return grid;
}

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

const puzzles = [
  {
    date: "2025-05-23", number: 810, theme: "Backpacking",
    spangram: "BACKPACKING",
    themeWords: ["TENT", "COMPASS", "CANTEEN", "TRAILMAP", "SLEEPING", "STOVE"],
    solutions: {
      TRAILMAP: [p(7,0),p(7,1),p(7,2),p(7,3),p(7,4),p(7,5),p(6,5),p(6,4)],
      TENT: [p(1,0),p(1,1),p(2,1),p(2,2)],
      STOVE: [p(5,0),p(5,1),p(5,2),p(5,3),p(5,4)],
      CANTEEN: [p(2,0),p(3,0),p(3,1),p(4,0),p(4,1),p(4,2),p(5,2)],
      COMPASS: [p(6,0),p(6,1),p(6,2),p(6,3),p(5,3),p(5,4),p(5,5)],
      SLEEPING: [p(3,2),p(3,3),p(3,4),p(3,5),p(4,5),p(4,4),p(4,3),p(5,3)],
      BACKPACKING: [p(0,0),p(0,1),p(0,2),p(0,3),p(0,4),p(0,5),p(1,5),p(2,5),p(3,5),p(4,5),p(5,5)],
    },
  },
  {
    date: "2025-05-24", number: 811, theme: "Staying Alive",
    spangram: "SURVIVALIST",
    themeWords: ["MACHETE", "HATCHET", "FLINT", "PARACORD", "TARP", "SHOVEL"],
    solutions: {
      HATCHET: [p(3,0),p(3,1),p(3,2),p(3,3),p(3,4),p(3,5),p(4,5)],
      MACHETE: [p(2,0),p(2,1),p(2,2),p(2,3),p(2,4),p(2,5),p(1,5)],
      FLINT: [p(4,0),p(4,1),p(4,2),p(5,2),p(5,3)],
      TARP: [p(7,0),p(7,1),p(7,2),p(7,3)],
      SHOVEL: [p(7,4),p(7,5),p(6,5),p(5,5),p(4,4),p(3,4)],
      PARACORD: [p(5,0),p(5,1),p(6,0),p(6,1),p(6,2),p(6,3),p(6,4),p(5,4)],
      SURVIVALIST: [p(0,0),p(0,1),p(0,2),p(0,3),p(0,4),p(0,5),p(1,4),p(1,3),p(1,2),p(1,1),p(1,0)],
    },
  },
  {
    date: "2025-05-25", number: 812, theme: "Summer Essentials",
    spangram: "BEACHBAG",
    themeWords: ["SUNSCREEN", "TOWEL", "FLIPFLOPS", "SUNGLASSES", "COOLER", "UMBRELLA"],
    solutions: {
      TOWEL: [p(2,0),p(2,1),p(2,2),p(2,3),p(2,4)],
      COOLER: [p(7,0),p(7,1),p(7,2),p(7,3),p(7,4),p(7,5)],
      BEACHBAG: [p(0,0),p(0,1),p(0,2),p(0,3),p(0,4),p(0,5),p(1,5),p(2,5),p(3,5)],
      SUNSCREEN: [p(0,0),p(1,0),p(2,0),p(3,0),p(4,0),p(5,0),p(6,0),p(7,0),p(7,1)],
      FLIPFLOPS: [p(3,1),p(3,2),p(3,3),p(3,4),p(4,4),p(5,4),p(6,4),p(7,4),p(7,3)],
      SUNGLASSES: [p(1,1),p(1,2),p(1,3),p(1,4),p(2,4),p(3,4),p(4,3),p(5,3),p(6,3),p(7,2)],
      UMBRELLA: [p(4,1),p(4,2),p(5,1),p(5,2),p(6,1),p(6,2),p(7,1),p(7,2)],
    },
  },
];

for (const puzzle of puzzles) {
  try {
    const grid = buildGrid(8, 6, puzzle.solutions);
    console.log(`\n#${puzzle.number} OK`);
    let ok = true;
    for (const w of [...puzzle.themeWords, puzzle.spangram]) {
      const f = findPathForWord(grid, w);
      if (!f) { console.log(`  ${w}: FAIL`); ok = false; }
    }
    if (ok) console.log("  all words verified");
    console.log("  grid:", JSON.stringify(grid));
  } catch (e) {
    console.log(`\n#${puzzle.number} ERR:`, e.message);
  }
}
