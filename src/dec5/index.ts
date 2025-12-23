interface Rng {
  start: number
  length: number
}

interface RangeMap {
  from: number
  to: number
  length: number
}

interface Mapper {
  fromThing: string
  toThing: string
  rangeMaps: RangeMap[]
}

function inRange(val: number, { from, length }: RangeMap): boolean {
  return val >= from && val < from + length
}

interface Overlap {
  intersection: Rng | undefined
  leftover: Rng[]
}

function calcOverlap(rng1: Rng, rng2: Rng): Overlap {
  const start = rng1.start
  const end = rng1.start + rng1.length
  const markers = [
    ...new Set([start, end, rng2.start, rng2.start + rng2.length]),
  ].sort((a, b) => a - b)
  while (markers[0] < start) markers.shift()
  while (markers[markers.length - 1] > end) markers.pop()
  let inside = start >= rng2.start && start < rng2.start + rng2.length

  let intersection: Rng | undefined = undefined
  const leftover: Rng[] = []

  for (let i = 1; i < markers.length; i++) {
    const range = { start: markers[i - 1], length: markers[i] - markers[i - 1] }
    if (inside) intersection = range
    else leftover.push(range)
    inside = !inside
  }
  return { intersection, leftover }
}

function applyMapper(val: number, mapper: Mapper): number {
  for (const rangeMap of mapper.rangeMaps)
    if (inRange(val, rangeMap)) return rangeMap.to + (val - rangeMap.from)
  return val
}

function applyRangeMap(
  unprocessed: Rng[],
  { from, to, length }: RangeMap,
): { processed: Rng[]; unprocessed: Rng[] } {
  const outUnprocessed: Rng[] = []
  const processed: Rng[] = []
  for (const rng of unprocessed) {
    const { leftover, intersection } = calcOverlap(rng, { start: from, length })
    outUnprocessed.push(...leftover)
    if (intersection) {
      processed.push({
        start: to + (intersection.start - from),
        length: intersection.length,
      })
    }
  }
  return { processed, unprocessed: outUnprocessed }
}

function applyMapperRng(rngs: Rng[], mapper: Mapper): Rng[] {
  let unprocessed = rngs
  const result: Rng[] = []
  for (const rangeMap of mapper.rangeMaps) {
    const rm = applyRangeMap(unprocessed, rangeMap)
    unprocessed = rm.unprocessed
    result.push(...rm.processed)
  }
  result.push(...unprocessed)
  return result
}

const mapperRe = /^([a-zA-Z]+)-to-([a-zA-Z]+)/g
function readMapper(lines: string[]): Mapper | undefined {
  let line = lines.shift()
  while (line?.trim() === '') line = lines.shift()
  if (!line) return undefined
  const [, fromThing, toThing] = [...line.matchAll(mapperRe)][0]
  const rangeMaps: RangeMap[] = []
  while ((line = lines.shift()?.trim())) {
    const [to, from, length] = line.split(/\s+/).map((v) => parseInt(v, 10))
    rangeMaps.push({ from, to, length })
  }
  return { fromThing, toThing, rangeMaps }
}
const seedRe = /^seeds: (.*)$/g

async function part1(lines: string[]) {
  const fromToMap: { [from: string]: Mapper } = {}

  const line = lines.shift()
  if (!line) throw new Error('No line')
  const [, seedLine] = [...line.matchAll(seedRe)][0]
  const seeds = seedLine.split(/\s+/).map((v) => parseInt(v, 10))
  const mappers: Mapper[] = []
  let mapper: Mapper | undefined
  while ((mapper = readMapper(lines))) {
    mappers.push(mapper)
    fromToMap[mapper.fromThing] = mapper
  }
  let thing = 'seed'
  let values = seeds
  while (thing !== 'location') {
    const mapper = fromToMap[thing]
    values = values.map((v) => applyMapper(v, mapper))
    thing = mapper.toThing
  }
  return Math.min(...values)
}

async function part2(lines: string[]) {
  const fromToMap: { [from: string]: Mapper } = {}

  const line = lines.shift()
  if (!line) throw new Error('No line')
  const [, seedLine] = [...line.matchAll(seedRe)][0]
  const seedNums = seedLine.split(/\s+/).map((v) => parseInt(v, 10))
  const seedRanges: Rng[] = []
  for (let i = 0; i < seedNums.length; i += 2)
    seedRanges.push({ start: seedNums[i], length: seedNums[i + 1] })

  const mappers: Mapper[] = []
  let mapper: Mapper | undefined
  while ((mapper = readMapper(lines))) {
    mappers.push(mapper)
    fromToMap[mapper.fromThing] = mapper
  }

  let thing = 'seed'
  let rngs = seedRanges
  while (thing !== 'location') {
    const mapper = fromToMap[thing]
    rngs = applyMapperRng(rngs, mapper)
    thing = mapper.toThing
  }
  return Math.min(...rngs.map((rng) => rng.start))
}

export default [part1, part2]
