import { Pos } from './pos'

export interface Size {
  width: number
  height: number
}

type SizeOrMatrix = Size | string[] | any[][]

export function matrixSize(matrix: string[] | any[][]): Size {
  return { width: matrix[0].length, height: matrix.length }
}

function toSize(sizeOrMatrix: SizeOrMatrix): Size {
  if ('width' in sizeOrMatrix && 'height' in sizeOrMatrix) return sizeOrMatrix
  else return matrixSize(sizeOrMatrix as string[] | any[][])
}

export function inBounds(pos: Pos, sizeOrMatrix: SizeOrMatrix): boolean {
  const size = toSize(sizeOrMatrix)
  return pos.x >= 0 && pos.x < size.width && pos.y >= 0 && pos.y < size.height
}

export function copyMatrix<T>(matrix: T[][]): T[][] {
  return matrix.map((row) => [...row])
}

export function initMatrix<T>(
  sizeOrMatrix: SizeOrMatrix,
  cons: () => T,
): T[][] {
  const { width, height } = toSize(sizeOrMatrix)
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, cons),
  )
}

export function transposeMatrix<T>(array: T[][]): T[][] {
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]))
}

export function forEachPos<T>(
  matrix: T[][],
  fn: (item: T, x: number, y: number) => void,
) {
  matrix.forEach((row, y) => row.forEach((item, x) => fn(item, x, y)))
}
