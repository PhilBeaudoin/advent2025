import { Dir, move } from '../dir'
import { forEachPos, inBounds, initMatrix, matrixSize } from '../matrix'
import { Pos, posKey } from '../pos'

type Item = '.' | '/' | '|' | '-' | '\\'

type DirToOutDirs = { [key in Dir]: Dir[] }
type ItemMap = { [key in Item]: DirToOutDirs }

const itemMap: ItemMap = {
  '.': { n: ['n'], e: ['e'], s: ['s'], w: ['w'] },
  '/': { n: ['e'], e: ['n'], s: ['w'], w: ['s'] },
  '\\': { n: ['w'], e: ['s'], s: ['e'], w: ['n'] },
  '-': { n: ['e', 'w'], e: ['e'], s: ['e', 'w'], w: ['w'] },
  '|': { n: ['n'], e: ['n', 's'], s: ['s'], w: ['n', 's'] },
}

type Map = Item[][]
interface Ray {
  pos: Pos
  dir: Dir
  outRays?: Ray[]
}

type DirToRay = { [key in Dir]: Ray }

type RayMap = DirToRay[][]

function readMap(lines: string[]): Map {
  return lines.map((line) => line.split('') as Item[])
}

function canonicalizeRay(ray: Ray, rayMap: RayMap): Ray {
  const cache = rayMap[ray.pos.y][ray.pos.x][ray.dir]
  if (cache) {
    if (ray.outRays && ray !== cache) throw new Error('Ray mismatch')
    return cache
  }
  rayMap[ray.pos.y][ray.pos.x][ray.dir] = ray
  return ray
}

function processRay(ray: Ray, map: Map, rayMap: RayMap) {
  const toProcess = [ray]
  while (toProcess.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ray = canonicalizeRay(toProcess.shift()!, rayMap)
    if (ray?.outRays) continue
    ray.outRays = itemMap[map[ray.pos.y][ray.pos.x]][ray.dir]
      .map((dir) => ({ pos: move(ray.pos, dir), dir }))
      .filter((ray) => inBounds(ray.pos, map))
      .map((ray) => canonicalizeRay(ray, rayMap))
    toProcess.push(...ray.outRays)
  }
}

function countEnergized(ray: Ray, map: Map, rayMap?: RayMap): number {
  rayMap = rayMap ? rayMap : initMatrix(map, () => ({} as DirToRay))
  processRay(ray, map, rayMap)
  const visitedPos = new Set<string>([posKey(ray.pos)])
  const visitedRays = new Set<Ray>([canonicalizeRay(ray, rayMap)])
  const queue = [ray]
  while (queue.length > 0) {
    const ray = queue.shift()
    for (const outRay of ray?.outRays || []) {
      if (!visitedRays.has(outRay)) {
        visitedPos.add(posKey(outRay.pos))
        visitedRays.add(outRay)
        queue.push(outRay)
      }
    }
  }
  return visitedPos.size
}

async function part1(lines: string[]) {
  const map = readMap(lines)
  return countEnergized({ pos: { x: 0, y: 0 }, dir: 'e' }, map)
}

async function part2(lines: string[]) {
  const map = readMap(lines)
  const rayMap = initMatrix(map, () => ({} as DirToRay))
  const { width, height } = matrixSize(map)
  const initRays: Ray[] = []
  forEachPos(map, (_, x, y) => {
    if (x === 0) initRays.push({ pos: { x, y }, dir: 'e' })
    if (x === width - 1) initRays.push({ pos: { x, y }, dir: 'w' })
    if (y === 0) initRays.push({ pos: { x, y }, dir: 's' })
    if (y === height - 1) initRays.push({ pos: { x, y }, dir: 'n' })
  })
  let maxEnergized = 0
  for (const ray of initRays) {
    const energized = countEnergized(ray, map, rayMap)
    if (energized > maxEnergized) maxEnergized = energized
  }
  return maxEnergized
}

export default [part1, part2]
