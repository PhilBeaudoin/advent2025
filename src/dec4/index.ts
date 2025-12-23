interface Card {
  id: number
  winning: number[]
  numbers: number[]
}

function parseNumbers(line: string): number[] {
  return line
    .trim()
    .split(/\s+/)
    .map((v) => parseInt(v, 10))
    .sort((a, b) => a - b)
}

const gameRE = /^Card\s+(\d+):\s*(.*)\s*\|\s*(.*)\s*$/g
function parseCard(line: string): Card {
  const match = [...line.matchAll(gameRE)][0]
  return {
    id: parseInt(match[1], 10),
    winning: parseNumbers(match[2]),
    numbers: parseNumbers(match[3]),
  }
}

function countMatches(card: Card): number {
  let i = 0
  let j = 0
  let matches = 0
  while (i < card.winning.length && j < card.numbers.length) {
    if (card.winning[i] === card.numbers[j]) {
      matches++
      i++
      j++
    } else if (card.winning[i] <= card.numbers[j]) i++
    else j++
  }
  return matches
}

async function part1(lines: string[]) {
  let sum = 0
  for (const line of lines) {
    const card = parseCard(line)
    const matches = countMatches(card)
    sum += matches === 0 ? 0 : Math.pow(2, matches - 1)
  }
  return sum
}

async function part2(lines: string[]) {
  const copiesPerCard = new Array(lines.length).fill(1)
  lines.forEach((line, i) => {
    const card = parseCard(line)
    const matches = countMatches(card)
    const copies = copiesPerCard[i]
    for (let j = 0; j < matches; j++) copiesPerCard[i + j + 1] += copies
  })
  return copiesPerCard.reduce((acc, copies) => acc + copies, 0)
}

export default [part1, part2]
