export interface Pos {
  x: number
  y: number
}

export function posKey(pos: Pos) {
  return `${pos.x},${pos.y}`
}

export function posEq(pos1: Pos, pos2: Pos) {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

export function manhattanDist(pos1: Pos, pos2: Pos) {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
}

export function posAdd(pos1: Pos, pos2: Pos) {
  return { x: pos1.x + pos2.x, y: pos1.y + pos2.y }
}

export function posSub(pos1: Pos, pos2: Pos) {
  return { x: pos1.x - pos2.x, y: pos1.y - pos2.y }
}

export function posMult(pos: Pos, factor: number) {
  return { x: pos.x * factor, y: pos.y * factor }
}

export function posDiv(pos: Pos, divisor: number) {
  return { x: pos.x / divisor, y: pos.y / divisor }
}
