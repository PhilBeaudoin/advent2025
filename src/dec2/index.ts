const COLORS = ['red', 'blue', 'green']

type Color = (typeof COLORS)[number]

type Round = { [color in Color]: number }

interface Game {
  id: number
  rounds: Round[]
}

function parseRound(round: string): Round {
  const result = { red: 0, blue: 0, green: 0 }
  for (const color of COLORS) {
    const re = new RegExp(`(\\d+) ${color}`, 'g')
    result[color] = parseInt([...round.matchAll(re)]?.[0]?.[1] ?? '0', 10)
  }
  return result
}

const gameRE = /^Game (\d+): (.*)$/g
function parseGame(line: string): Game {
  const match = [...line.matchAll(gameRE)][0]
  return {
    id: parseInt(match[1], 10),
    rounds: match[2].split(';').map(parseRound),
  }
}

async function part1(lines: string[]) {
  const max = { red: 12, green: 13, blue: 14 }
  let sum = 0
  for (const line of lines) {
    const game = parseGame(line)
    let possible = true
    for (const round of game.rounds) {
      for (const color of COLORS)
        if (round[color] > max[color]) possible = false
    }
    if (possible) sum += game.id
  }
  return sum
}

async function part2(lines: string[]) {
  let sum = 0
  for (const line of lines) {
    const game = parseGame(line)
    const min = { red: 0, green: 0, blue: 0 }
    for (const round of game.rounds) {
      for (const color of COLORS)
        if (round[color] > min[color]) min[color] = round[color]
    }
    let product = 1
    for (const color of COLORS) product *= min[color]
    sum += product
  }
  return sum
}

export default [part1, part2]
