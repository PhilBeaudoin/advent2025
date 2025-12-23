import { hFlipSMatrix, transposeS } from '../strMatrix'

function rowWeight(row: string): number {
  const width = row.length
  return row
    .split('')
    .reduce((acc, cur, i) => (acc += cur === 'O' ? width - i : 0), 0)
}

function matrixWeight(matrix: string[]): number {
  return transposeS(matrix).reduce((acc, cur) => acc + rowWeight(cur), 0)
}

function packRow(row: string): string {
  const result = Array.from({ length: row.length }, () => '.')
  let pos = 0
  for (let i = 0; i < row.length; i++) {
    if (row[i] === 'O') {
      result[pos] = 'O'
      pos++
    } else if (row[i] === '#') {
      result[i] = '#'
      pos = i + 1
    }
  }
  return result.join('')
}

function packWest(matrix: string[]): string[] {
  return matrix.map((row) => packRow(row))
}

function packNorth(matrix: string[]): string[] {
  return transposeS(packWest(transposeS(matrix)))
}

function packEast(matrix: string[]): string[] {
  return hFlipSMatrix(packWest(hFlipSMatrix(matrix)))
}

function packSouth(matrix: string[]): string[] {
  return transposeS(hFlipSMatrix(packWest(hFlipSMatrix(transposeS(matrix)))))
}

function cycle(matrix: string[]): string[] {
  return packEast(packSouth(packWest(packNorth(matrix))))
}

async function part1(lines: string[]) {
  return matrixWeight(packNorth(lines))
}

const CACHE: { [key: string]: number } = {}
const REPEAT = 1000000000

async function part2(lines: string[]) {
  let key = lines.join('')
  CACHE[key] = 0
  for (let i = 1; i <= REPEAT; i++) {
    lines = cycle(lines)
    key = lines.join('')
    if (key in CACHE) {
      const cycleStart = CACHE[key]
      const cycleLength = i - cycleStart
      const cycleIndex = (REPEAT - cycleStart) % cycleLength
      for (let j = 0; j < cycleIndex; j++) lines = cycle(lines)
      break
    }
    CACHE[key] = i
  }
  return matrixWeight(lines)
}

export default [part1, part2]
