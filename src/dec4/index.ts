interface Grid {
  width: number
  height: number
  cells: string[][]
}

function parseGrid(lines: string[]): Grid {
  const height = lines.length
  const width = lines[0].length
  const cells = lines.map((line) => line.split(''))
  return { width, height, cells }
}

function isRoll(grid: Grid, x: number, y: number): boolean {
  if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return false
  const v = grid.cells[y][x]
  return v === '@' || v === '#'
}

function countAdjacentRolls(grid: Grid, x: number, y: number): number {
  let count = 0
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      if (isRoll(grid, x + dx, y + dy)) count++
    }
  }
  return count
}

async function part1(lines: string[]) {
  const grid = parseGrid(lines)
  let accessibleRolls = 0
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (isRoll(grid, x, y)) {
        if (countAdjacentRolls(grid, x, y) < 4) accessibleRolls++
      }
    }
  }
  return accessibleRolls
}

async function part2(lines: string[]) {
  const grid = parseGrid(lines)
  let removed = 0
  let prevRemoved = -1
  while (removed !== prevRemoved) {
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if (isRoll(grid, x, y))
          if (countAdjacentRolls(grid, x, y) < 4) grid.cells[y][x] = '#'
      }
    }
    // Remove all marked rolls
    prevRemoved = removed
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if (grid.cells[y][x] === '#') {
          grid.cells[y][x] = '.'
          removed++
        }
      }
    }
  }
  return removed
}

export default [part1, part2]
