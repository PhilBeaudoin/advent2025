import { flipStr } from '../strings'
import { transposeS } from '../strMatrix'

type EqFunc = (a: string, b: string) => boolean

function oneDiff(a: string, b: string): boolean {
  return (
    a.split('').reduce((acc, cur, i) => acc + (cur === b[i] ? 0 : 1), 0) === 1
  )
}

function readMatrix(lines: string[]): string[] {
  const matrix: string[] = []
  while (lines.length > 0) {
    const line = lines.shift()
    if (!line) break
    matrix.push(line)
  }
  return matrix
}

function isSymmetrical(matrix: string[], len: number, eq: EqFunc): boolean {
  const width = matrix[0].length
  const strLen = Math.min(len, width - len)
  const str1 = matrix.map((row) => row.slice(len - strLen, len)).join('')
  const str2 = matrix
    .map((row) => flipStr(row.slice(len, len + strLen)))
    .join('')
  return eq(str1, str2)
}

function check(lines: string[], eq: EqFunc): number {
  let matrix = readMatrix(lines)
  let count = 0
  while (matrix.length > 0) {
    let result = 0
    for (let i = 1; result === 0 && i < matrix[0].length; i++)
      result = isSymmetrical(matrix, i, eq) ? i : 0
    const transposed = transposeS(matrix)
    for (let i = 1; result === 0 && i < transposed[0].length; i++)
      result = isSymmetrical(transposed, i, eq) ? i * 100 : 0
    count += result
    matrix = readMatrix(lines)
  }
  return count
}

async function part1(lines: string[]) {
  return check(lines, (a, b) => a === b)
}

async function part2(lines: string[]) {
  return check(lines, oneDiff)
}

export default [part1, part2]
