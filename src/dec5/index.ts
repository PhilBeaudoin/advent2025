import { inRanges, NumRange, rangeLength, rangeUnion } from '../ranges'

function parse(lines: string[]) {
  const ranges: NumRange[] = []
  const ingredients: number[] = []
  let phase: 'ranges' | 'ingredients' = 'ranges'
  for (const line of lines) {
    if (line === '') {
      phase = 'ingredients'
      continue
    }
    if (phase === 'ranges') {
      const [min, max] = line.split('-').map((x) => parseInt(x, 10))
      ranges.push({ min, max: max + 1 })
    } else {
      // parse ingredients
      ingredients.push(parseInt(line, 10))
    }
  }

  return { ranges: rangeUnion(ranges), ingredients }
}

async function part1(lines: string[]) {
  const { ranges, ingredients } = parse(lines)
  let fresh = 0
  for (const ingredient of ingredients)
    if (inRanges(ingredient, ranges)) fresh++
  return fresh
}

async function part2(lines: string[]) {
  const { ranges } = parse(lines)
  let fresh = 0
  for (const range of ranges) fresh += rangeLength(range)
  return fresh
}

export default [part1, part2]
