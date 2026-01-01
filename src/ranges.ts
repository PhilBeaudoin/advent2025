/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
export interface NumRange {
  min: number
  max: number
}

export function rangeLength(range: NumRange): number {
  return range.max - range.min
}

export function isEmptyRange(range: NumRange): boolean {
  return range.min >= range.max
}

export function rangesLength(ranges: NumRange[]): number {
  ranges = rangeUnion(ranges)
  return ranges.reduce((acc, range) => acc + rangeLength(range), 0)
}

export function sliceRange(
  range: NumRange,
  sliceOff: NumRange,
): { sliced: NumRange; remainder: NumRange[] } {
  const min = Math.max(range.min, sliceOff.min)
  const max = Math.min(range.max, sliceOff.max)
  if (min >= max) return { sliced: { min: 0, max: 0 }, remainder: [range] }
  const sliced: NumRange = { min, max }
  const remainder: NumRange[] = []
  if (range.min < min) remainder.push({ min: range.min, max: min })
  if (range.max > max) remainder.push({ min: max, max: range.max })
  return { sliced, remainder }
}

export function sliceRanges(
  ranges: NumRange[],
  sliceOff: NumRange,
): { sliced: NumRange[]; remainder: NumRange[] } {
  const sliced: NumRange[] = []
  const remainder: NumRange[] = []
  for (const range of ranges) {
    const { sliced: slicedRange, remainder: remainderRange } = sliceRange(
      range,
      sliceOff,
    )
    if (!isEmptyRange(slicedRange)) sliced.push(slicedRange)
    remainder.push(...remainderRange)
  }
  return { sliced, remainder }
}

function sortRanges(ranges: NumRange[]): NumRange[] {
  return [...ranges].sort((a, b) => a.min - b.min)
}

function addToRangeUnion(partialUnion: NumRange[], r: NumRange): NumRange[] {
  if (partialUnion.length === 0) return [{ ...r }]
  const last = partialUnion[partialUnion.length - 1]
  if (last.max < r.min) return [...partialUnion, { ...r }]
  if (r.max > last.max) last.max = r.max
  return partialUnion
}

export function rangeUnion(ranges: NumRange[]): NumRange[] {
  const sortedRanges = sortRanges(ranges)
  const result = sortedRanges.reduce(
    (acc, r) => addToRangeUnion(acc, r),
    [] as NumRange[],
  )
  return result
}

export function rangeIntersection(
  ranges1: NumRange[],
  ranges2: NumRange[],
): NumRange[] {
  ranges1 = rangeUnion(ranges1)
  ranges2 = rangeUnion(ranges2)
  const intersection: NumRange[] = []
  for (const r of ranges1) intersection.push(...sliceRanges(ranges2, r).sliced)
  return intersection
}

export function rangeSubtraction(
  ranges1: NumRange[],
  ranges2: NumRange[],
): NumRange[] {
  ranges1 = rangeUnion(ranges1)
  ranges2 = rangeUnion(ranges2)
  const subtraction: NumRange[] = []
  while (true) {
    while (
      ranges1.length > 0 &&
      ranges1[0].max <= (ranges2[0]?.min ?? -Infinity)
    ) {
      subtraction.push(ranges1.shift()!)
    }
    if (ranges1.length === 0) break
    while (
      ranges2.length !== 0 &&
      (ranges2[0]?.max ?? -Infinity) <= ranges1[0].min
    ) {
      ranges2.shift()
    }
    if (ranges2.length === 0) break
    const { remainder } = sliceRange(ranges1.shift()!, ranges2[0])
    ranges1.unshift(...remainder)
  }
  subtraction.push(...ranges1)
  return subtraction
}

export function inRange(n: number, range: NumRange): boolean {
  return n >= range.min && n < range.max
}

export function inRanges(n: number, ranges: NumRange[]): boolean {
  for (const range of ranges) if (inRange(n, range)) return true
  return false
}
