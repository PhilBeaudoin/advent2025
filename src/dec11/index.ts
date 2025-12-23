import { transposeMatrix } from '../matrix'
import { Pos, manhattanDist, posEq } from '../pos'

function findEmptyRows(grid: string[][]) {
  return grid.reduce((acc, row, i) => {
    if (row.every((c) => c === '.')) acc.push(i)
    return acc
  }, [] as number[])
}

function computeShift(grid: string[][], emptyCols: number[]) {
  const width = grid[0].length
  const result: number[] = []
  let shift = 0
  for (let x = 0; x < width; x++) {
    if (emptyCols.includes(x)) shift++
    result.push(shift)
  }
  return result
}

function app(lines: string[], expansion: number) {
  const grid = lines.map((line) => line.split(''))
  const emptyRows = findEmptyRows(grid)
  const transposedGrid = transposeMatrix(grid)
  const emptyCols = findEmptyRows(transposedGrid)

  const shiftX = computeShift(grid, emptyCols)
  const shiftY = computeShift(transposedGrid, emptyRows)

  const coords = grid.reduce((acc, row, y) => {
    row.forEach((c, x) => {
      if (c === '#')
        acc.push({
          x: x + shiftX[x] * (expansion - 1),
          y: y + shiftY[y] * (expansion - 1),
        })
    })
    return acc
  }, [] as Pos[])

  const result: number[] = []
  for (const coord1 of coords) {
    for (const coord2 of coords) {
      if (posEq(coord1, coord2)) continue
      result.push(manhattanDist(coord1, coord2))
    }
  }
  const sum = result.reduce((acc, dist) => acc + dist, 0)
  return sum / 2
}

async function part1(lines: string[]) {
  return app(lines, 2)
}

async function part2(lines: string[]) {
  return app(lines, 1000000)
}

export default [part1, part2]
