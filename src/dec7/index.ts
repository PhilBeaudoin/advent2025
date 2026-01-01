const debug = false

type Cell = '.' | '|' | '^'

type CellCode = number

function toCell(c: CellCode): Cell {
  if (c > 0) return '|'
  if (c < 0) return '^'
  return '.'
}

interface Grid {
  width: number
  lines: CellCode[][]
}

function print1(grid: Grid) {
  const { width, lines } = grid
  console.log(`Grid width=${width} height=${lines.length / width}`)
  console.log(
    lines.map((line) => line.map((c) => toCell(c)).join('')).join('\n'),
  )
}

function print2(grid: Grid) {
  const { width, lines } = grid
  console.log(`Grid width=${width} height=${lines.length / width}`)
  // print digits with 2 leading 0s
  console.log(
    lines
      .map((line) =>
        line
          .map((c) =>
            c >= 0 ? c.toString().padStart(3, '0') : ' ' + toCell(c) + ' ',
          )
          .join(' '),
      )
      .join('\n'),
  )
}

function read(inLines: string[]): Grid {
  if (inLines.length === 0) throw new Error('No input lines')
  const width = inLines[0].length
  const lines: CellCode[][] = []
  for (const inLine of inLines) {
    if (inLine.length !== width) throw new Error('Inconsistent line width')
    const line: CellCode[] = []
    lines.push(line)
    for (const char of inLine) {
      if (char === '|' || char === 'S') line.push(1)
      else if (char === '^') line.push(-1)
      else if (char === '.') line.push(0)
      else throw new Error(`Unknown cell type: ${char}`)
    }
  }
  return { width, lines }
}

function updateLine1(grid: Grid, lineIdx: number): number {
  if (lineIdx === 0) return 0
  // Extend | unless it is blocked by ^, split it
  const prev = grid.lines[lineIdx - 1]
  const curr = grid.lines[lineIdx]

  let count = 0
  for (let i = 0; i < grid.width; i++) {
    const prevCell = toCell(prev[i])
    const currCell = toCell(curr[i])
    if (prevCell === '|') {
      if (currCell === '^') {
        count++
        // Split: replace character before and after ^ with | in current line
        if (i > 0) grid.lines[lineIdx][i - 1] = 1
        if (i < grid.width - 1) grid.lines[lineIdx][i + 1] = 1
      } else {
        grid.lines[lineIdx][i] = 1
      }
    }
  }
  if (debug) print1(grid)
  return count
}

function updateLine2(grid: Grid, lineIdx: number) {
  if (lineIdx === 0) return 0
  // Extend | unless it is blocked by ^, split it
  const prev = grid.lines[lineIdx - 1]
  const curr = grid.lines[lineIdx]

  for (let i = 0; i < grid.width; i++) {
    const prevCell = prev[i]
    const currCell = curr[i]
    if (prevCell > 0) {
      if (currCell === -1) {
        // Split: replace character before and after ^ with number
        if (i > 0) grid.lines[lineIdx][i - 1] += prevCell
        if (i < grid.width - 1) grid.lines[lineIdx][i + 1] += prevCell
      } else {
        grid.lines[lineIdx][i] += prevCell
      }
    }
  }
  if (debug) print2(grid)
}

async function run1(lines: string[]) {
  const grid = read(lines)
  let count = 0
  for (let lineIdx = 1; lineIdx < grid.lines.length; lineIdx++)
    count += updateLine1(grid, lineIdx)
  return count
}

async function run2(lines: string[]) {
  const grid = read(lines)
  for (let lineIdx = 1; lineIdx < grid.lines.length; lineIdx++)
    updateLine2(grid, lineIdx)
  // Sum non-negative cells on last line
  let count = 0
  const lastLine = grid.lines[grid.lines.length - 1]
  for (const cell of lastLine) if (cell > 0) count += cell
  return count
}

const part1 = async (lines: string[]) => run1(lines)
const part2 = async (lines: string[]) => run2(lines)

export default [part1, part2]
