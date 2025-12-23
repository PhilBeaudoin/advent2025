function computeKey(x: number, y: number) {
  return `${x},${y}`
}

interface Part {
  val: number
}

type PartMap = { [key: string]: Part }

function* around(x: number, y: number) {
  for (let i = x - 1; i <= x + 1; i++)
    for (let j = y - 1; j <= y + 1; j++)
      if (i !== x || j !== y) yield computeKey(i, j)
}

const numberRe = /(\d+)/g
const symbolRe = /[^.\d]/g
const gearsRe = /\*/g

function makePartMap(lines: string[]): PartMap {
  const partMap: { [key: string]: Part } = {}
  let y = 0
  for (const line of lines) {
    const matches = line.matchAll(numberRe)
    for (const match of matches) {
      const x = match.index ?? 0
      const part = { val: parseInt(match[0], 10) }
      for (let i = 0; i < match[0].length; i++)
        partMap[computeKey(x + i, y)] = part
    }
    y++
  }
  return partMap
}

async function part1(lines: string[]) {
  const partMap = makePartMap(lines)
  let y = 0
  const parts = new Set<Part>()
  for (const line of lines) {
    const matches = line.matchAll(symbolRe)
    for (const match of matches) {
      const x = match.index ?? 0
      for (const key of around(x, y)) if (partMap[key]) parts.add(partMap[key])
    }
    y++
  }
  return [...parts].reduce((acc, part) => acc + part.val, 0)
}

async function part2(lines: string[]) {
  const partMap = makePartMap(lines)
  let sum = 0
  let y = 0
  for (const line of lines) {
    const matches = line.matchAll(gearsRe)
    for (const match of matches) {
      const x = match.index ?? 0
      const parts = new Set<Part>()
      for (const key of around(x, y)) if (partMap[key]) parts.add(partMap[key])
      if (parts.size > 1)
        sum += [...parts].reduce((acc, part) => acc * part.val, 1)
    }
    y++
  }
  return sum
}

export default [part1, part2]
