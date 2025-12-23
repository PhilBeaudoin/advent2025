import { flipStr } from './strings'

export function transposeS(matrix: string[]): string[] {
  const result: string[] = []
  for (let i = 0; i < matrix[0].length; i++) {
    result.push(matrix.map((row) => row[i]).join(''))
  }
  return result
}

export function hFlipSMatrix(matrix: string[]): string[] {
  return matrix.map((row) => flipStr(row))
}
