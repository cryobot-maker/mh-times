function isBlack(grid, r, c) {
  return grid[r][c] === "#";
}

function collect(grid, r, c, dir) {
  const cells = [];
  let row = r;
  let col = c;
  const size = grid.length;
  while (row >= 0 && row < size && col >= 0 && col < size && !isBlack(grid, row, col)) {
    cells.push({ row, col });
    if (dir === "across") col++;
    else row++;
  }
  return cells;
}

function startsAcross(grid, r, c) {
  if (isBlack(grid, r, c)) return false;
  return c === 0 || isBlack(grid, r, c - 1);
}

function startsDown(grid, r, c) {
  if (isBlack(grid, r, c)) return false;
  return r === 0 || isBlack(grid, r - 1, c);
}

function validate(name, grid) {
  console.log("\n", name);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      if (isBlack(grid, r, c)) continue;
      if (startsAcross(grid, r, c)) {
        const w = collect(grid, r, c, "across").map(({ row, col }) => grid[row][col]).join("");
        console.log(`  A ${r},${c}: ${w}`);
      }
      if (startsDown(grid, r, c)) {
        const w = collect(grid, r, c, "down").map(({ row, col }) => grid[row][col]).join("");
        console.log(`  D ${r},${c}: ${w}`);
      }
    }
  }
}

validate("25", [
  ["C", "R", "A", "B", "#"],
  ["H", "I", "D", "E", "#"],
  ["I", "D", "E", "A", "S"],
  ["P", "E", "A", "R", "#"],
  ["#", "T", "E", "A", "R"],
]);

validate("24a", [
  ["S", "N", "O", "W", "#"],
  ["K", "#", "I", "#", "E"],
  ["A", "L", "E", "R", "T"],
  ["T", "#", "M", "#", "S"],
  ["E", "A", "S", "Y", "#"],
]);

validate("24b", [
  ["S", "N", "O", "W", "#"],
  ["K", "#", "I", "E", "S"],
  ["A", "L", "E", "R", "T"],
  ["T", "#", "M", "E", "S"],
  ["E", "A", "S", "Y", "#"],
]);

validate("23", [
  ["M", "O", "O", "N", "#"],
  ["A", "#", "R", "#", "E"],
  ["R", "I", "S", "E", "S"],
  ["S", "#", "E", "#", "N"],
  ["#", "H", "A", "L", "F"],
]);
