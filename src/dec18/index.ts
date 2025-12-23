import { Dir, URDL, move, toCompass } from '../dir'
import { Pos } from '../pos'

interface Instruction {
  dir: Dir
  dist: number
}

function parseColor(color: string): Instruction {
  const [_, dist, dirDigit] = /\(#(.{5})(.)\)/.exec(color) ?? []
  const dir = ['e', 's', 'w', 'n'][parseInt(dirDigit, 10)] as Dir
  return { dir, dist: parseInt(dist, 16) }
}

function calcVertices(instructions: Instruction[]): Pos[] {
  let pos: Pos = { x: 0, y: 0 }
  const vertices = [pos]
  for (const { dir, dist } of instructions) {
    pos = move(pos, dir, dist)
    vertices.push(pos)
  }
  return vertices
}

function computeArea(instructions: Instruction[]): number {
  const boundary = instructions.reduce((acc, { dist }) => acc + dist, 0)
  const vertices = calcVertices(instructions)
  let interior = 0
  for (let i = 0; i < vertices.length; i++) {
    const { x, y } = vertices[i]
    const { x: nx, y: ny } = vertices[(i + 1) % vertices.length]
    interior += x * ny - nx * y
  }
  return (Math.abs(interior) + boundary) / 2 + 1
}

async function part1(lines: string[]) {
  const instructions = lines.map((line) => {
    const [urdl, dist] = line.split(' ')
    return {
      dir: toCompass(urdl as URDL),
      dist: parseInt(dist, 10),
    }
  })
  return computeArea(instructions)
}

async function part2(lines: string[]) {
  const instructions = lines.map((line) => {
    const [_, __, color] = line.split(' ')
    return parseColor(color)
  })
  return computeArea(instructions)
}

export default [part1, part2]
