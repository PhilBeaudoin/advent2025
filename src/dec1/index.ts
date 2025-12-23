const firstRE = /^[^0-9]*([0-9])/g
const lastRE = /([0-9])[^0-9]*$/g

const digitStrMap = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
}

async function part1(lines: string[]) {
  return lines.reduce((acc, line) => {
    const first = [...line.matchAll(firstRE)][0][1]
    const last = [...line.matchAll(lastRE)][0][1]
    const value = parseInt(`${first}${last}`, 10)
    return acc + value
  }, 0)
}

function findAll(line: string, str: string) {
  const positions: number[] = []
  let index = line.indexOf(str)
  while (index !== -1) {
    positions.push(index)
    index = line.indexOf(str, index + 1)
  }
  return positions
}

async function part2(lines: string[]) {
  return lines.reduce((acc, line) => {
    const found: { val: string; index: number }[] = []
    const firstMatch = [...line.matchAll(firstRE)]?.[0]
    if (firstMatch?.index !== undefined) {
      found.push({
        val: firstMatch[1],
        index: firstMatch.index + firstMatch[0].length - 1 ?? 0,
      })
    }
    const lastMatch = [...line.matchAll(lastRE)]?.[0]
    if (lastMatch?.index !== undefined) {
      found.push({ val: lastMatch[1], index: lastMatch.index ?? 0 })
    }
    for (const [str, val] of Object.entries(digitStrMap)) {
      const positions = findAll(line, str)
      positions.forEach((index) => {
        found.push({ val, index })
      })
    }
    found.sort((a, b) => a.index - b.index)
    const first = found[0].val
    const last = found[found.length - 1].val
    const value = parseInt(`${first}${last}`, 10)
    return acc + value
  }, 0)
}

export default [part1, part2]
