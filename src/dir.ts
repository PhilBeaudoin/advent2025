import { Pos } from './pos'

export const DIRS = ['n', 'e', 's', 'w'] as const

export type Dir = (typeof DIRS)[number]
export type Rotation = 'cw' | 'ccw'
export type Transformation = Rotation | 'flip' | 'none'

export function flipDir(dir: Dir): Dir {
  switch (dir) {
    case 'n':
      return 's'
    case 'e':
      return 'w'
    case 's':
      return 'n'
    case 'w':
      return 'e'
  }
}

export function isFlipDir(dir1: Dir, dir2: Dir): boolean {
  return flipDir(dir1) === dir2
}

export function rotateCW(dir: Dir): Dir {
  switch (dir) {
    case 'n':
      return 'e'
    case 'e':
      return 's'
    case 's':
      return 'w'
    case 'w':
      return 'n'
  }
}

export function isCW(dir1: Dir, dir2: Dir): boolean {
  return rotateCW(dir1) === dir2
}

export function rotateCCW(dir: Dir): Dir {
  switch (dir) {
    case 'n':
      return 'w'
    case 'e':
      return 'n'
    case 's':
      return 'e'
    case 'w':
      return 's'
  }
}

export function isCCW(dir1: Dir, dir2: Dir): boolean {
  return rotateCCW(dir1) === dir2
}

export function transform(dir: Dir, transformation: Transformation): Dir {
  switch (transformation) {
    case 'cw':
      return rotateCW(dir)
    case 'ccw':
      return rotateCCW(dir)
    case 'flip':
      return flipDir(dir)
    case 'none':
      return dir
  }
}

export function getTransformation(dir1: Dir, dir2: Dir): Transformation {
  if (isCW(dir1, dir2)) return 'cw'
  if (isCCW(dir1, dir2)) return 'ccw'
  if (isFlipDir(dir1, dir2)) return 'flip'
  return 'none'
}

export function getRotation(dir1: Dir, dir2: Dir): Rotation {
  if (isCW(dir1, dir2)) return 'cw'
  if (isCCW(dir1, dir2)) return 'ccw'
  throw new Error(`Cannot rotate ${dir1} to ${dir2}`)
}

export function move(pos: Pos, dir: Dir, dist = 1): Pos {
  switch (dir) {
    case 'n':
      return { x: pos.x, y: pos.y - dist }
    case 'e':
      return { x: pos.x + dist, y: pos.y }
    case 's':
      return { x: pos.x, y: pos.y + dist }
    case 'w':
      return { x: pos.x - dist, y: pos.y }
  }
}

export type URDL = 'U' | 'R' | 'D' | 'L'

export function toCompass(urdl: URDL): Dir {
  switch (urdl) {
    case 'U':
      return 'n'
    case 'R':
      return 'e'
    case 'D':
      return 's'
    case 'L':
      return 'w'
  }
}

export function fromCompass(dir: Dir): URDL {
  switch (dir) {
    case 'n':
      return 'U'
    case 'e':
      return 'R'
    case 's':
      return 'D'
    case 'w':
      return 'L'
  }
}
