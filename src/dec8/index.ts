import { FileType } from '../types'

const debug = false

interface Point {
  x: number
  y: number
  z: number
}

interface Input {
  points: Point[]
  dist: number[][]
}

interface DistInfo {
  p1: number
  p2: number
  distance: number
}

interface Circuit {
  id: number
  ps: number[]
  lastP1?: number
  lastP2?: number
}

type Circuits = Map<number, Circuit>

interface CircuitInfo {
  p: number
  circuit: Circuit
}

function dist(input: Input, p1: number, p2: number): number {
  if (input.dist[p1][p2] === undefined) {
    const pt1 = input.points[p1]
    const pt2 = input.points[p2]
    const d = Math.sqrt(
      (pt1.x - pt2.x) * (pt1.x - pt2.x) +
        (pt1.y - pt2.y) * (pt1.y - pt2.y) +
        (pt1.z - pt2.z) * (pt1.z - pt2.z),
    )
    input.dist[p1][p2] = d
  }
  return input.dist[p1][p2]
}

function makeDistInfos(input: Input): DistInfo[] {
  const distInfos: DistInfo[] = []
  for (let i = 0; i < input.points.length; i++) {
    for (let j = i + 1; j < input.points.length; j++) {
      distInfos.push({ p1: i, p2: j, distance: dist(input, i, j) })
    }
  }
  distInfos.sort((a, b) => a.distance - b.distance)
  return distInfos
}

function makeCircuitInfos(
  input: Input,
  distInfos: DistInfo[],
  num: number,
): Circuits {
  const circuits: Circuits = new Map()
  for (let i = 0; i < input.points.length; i++) {
    circuits.set(i, { id: i, ps: [i] })
  }

  const circuitInfos: CircuitInfo[] = Array.from(
    { length: input.points.length },
    (_, i) => ({
      p: i,
      circuit: circuits.get(i) as Circuit,
    }),
  )
  for (let i = 0; i < num; ++i) {
    const distInfo = distInfos[i]
    const c1 = circuitInfos[distInfo.p1].circuit
    const c2 = circuitInfos[distInfo.p2].circuit
    if (c1 === c2) continue
    if (debug) {
      // Log as 3d coordinates
      const pt1 = input.points[distInfo.p1]
      const pt2 = input.points[distInfo.p2]
      console.log(
        `Connecting point ${distInfo.p1} (${pt1.x},${pt1.y},${
          pt1.z
        }) to point ${distInfo.p2} (${pt2.x},${pt2.y},${
          pt2.z
        }) with distance ${distInfo.distance.toFixed(2)}`,
      )
    }
    // Merge c2 into c1
    for (const p of c2.ps) {
      circuitInfos[p].circuit = c1
      c1.ps.push(p)
    }
    c1.lastP1 = distInfo.p1
    c1.lastP2 = distInfo.p2
    circuits.delete(c2.id)
    // break if there is only one circuit left
    if (circuits.size === 1) break
  }
  return circuits
}

function read(lines: string[]): Input {
  if (lines.length === 0) throw new Error('No input lines')
  const points: Point[] = []
  for (const line of lines) {
    const [x, y, z] = line.split(',').map((v) => parseInt(v, 10))
    points.push({ x, y, z })
  }
  const dist: number[][] = Array.from({ length: points.length }, () =>
    Array(points.length).fill(undefined),
  )
  return { points, dist }
}

function multCircuitSizes(circuits: Circuits, topN: number): number {
  const sortedCircuits = Array.from(circuits.values()).sort(
    (a, b) => b.ps.length - a.ps.length,
  )
  const selectedCircuits = sortedCircuits.slice(0, topN)

  if (debug) console.log('Circuits:', selectedCircuits)
  let result = 1
  for (const circuit of selectedCircuits) result *= circuit.ps.length
  return result
}

async function run1(lines: string[], file: FileType) {
  const input = read(lines)
  const num = file === 'example' ? 10 : 1000
  const distInfos = makeDistInfos(input)
  const circuitInfos = makeCircuitInfos(input, distInfos, num)
  return multCircuitSizes(circuitInfos, 3)
}

async function run2(lines: string[]) {
  const input = read(lines)
  const distInfos = makeDistInfos(input)
  const circuitInfos = makeCircuitInfos(input, distInfos, Infinity)
  // Mult last point X coords
  const { lastP1, lastP2 } = Array.from(circuitInfos.values())[0]
  if (lastP1 === undefined || lastP2 === undefined)
    throw new Error('No last points found')
  return input.points[lastP1].x * input.points[lastP2].x
}

const part1 = async (lines: string[], file: FileType) => run1(lines, file)
const part2 = async (lines: string[]) => run2(lines)

export default [part1, part2]
