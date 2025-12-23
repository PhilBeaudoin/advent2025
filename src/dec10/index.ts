interface Point {
  x: number
  y: number
  dist: number
}

interface Delta {
  dx: number
  dy: number
}

const allConns: Delta[] = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
]

const connMap: { [letter: string]: Delta[] } = {
  '.': [],
  S: allConns,
  '|': [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ],
  '-': [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
  ],
  L: [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
  ],
  J: [
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
  ],
  '7': [
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ],
  F: [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
  ],
}

function makeConnGrid(lines: string[]): number[][] {
  const width = lines[0].length * 2 + 1
  const height = lines.length * 2 + 1
  return new Array(height).fill(0).map(() => new Array(width).fill(2))
}

function makeDistGrid(lines: string[]): number[][] {
  const width = lines[0].length
  const height = lines.length
  return new Array(height).fill(0).map(() => new Array(width).fill(Infinity))
}

function getDistGrid(lines: string[]) {
  const connGrid = makeConnGrid(lines)
  const distGrid = makeDistGrid(lines)
  const front: Point[] = []
  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[0].length; x++) {
      const letter = lines[y][x]
      if (letter === 'S') front.push({ x, y, dist: 0 })
      const conn = connMap[letter]
      for (const { dx, dy } of conn) {
        connGrid[y * 2 + dy + 1][x * 2 + dx + 1]--
      }
    }
  }
  let next: Point | undefined
  while ((next = front.shift()) !== undefined) {
    const { x, y, dist } = next
    if (distGrid[y][x] < dist) continue
    distGrid[y][x] = dist
    for (const { dx, dy } of allConns) {
      const conn = connGrid[y * 2 + dy + 1][x * 2 + dx + 1]
      if (conn === 0) front.push({ x: x + dx, y: y + dy, dist: dist + 1 })
    }
  }
  return { connGrid, distGrid }
}

async function part1(lines: string[]) {
  const { distGrid } = getDistGrid(lines)
  return Math.max(...distGrid.flatMap((v) => v).filter((v) => v !== Infinity))
}

async function part2(lines: string[]) {
  const { distGrid, connGrid } = getDistGrid(lines)
  let insideCount = 0
  distGrid.forEach((row, y) => {
    let insideTop = false
    let insideBottom = false
    row.forEach((val, x) => {
      if (val === Infinity) {
        if (insideTop && insideBottom) insideCount++
      } else {
        const top = connGrid[y * 2][x * 2 + 1]
        const bottom = connGrid[y * 2 + 2][x * 2 + 1]
        if (top === 0) insideTop = !insideTop
        if (bottom === 0) insideBottom = !insideBottom
      }
    })
  })
  return insideCount
}

export default [part1, part2]
