const CACHE: { [key: string]: number | undefined } = {}

type State = '.' | '#' | '?'

interface Row {
  states: State[]
  groups: number[]
}

function shift(states: State[], state: State) {
  while (states[0] === state) states.shift()
}

// Assumes parameter has been called
function fitFirst(row: Row): Row | undefined {
  const size = row.groups[0]
  if (row.states.length < size) return undefined
  if (!row.states.slice(0, size).every((s) => s !== '.')) return undefined
  if (row.states.length === size)
    return { states: [], groups: row.groups.slice(1) }
  if (row.states[size] === '#') return undefined
  return { states: row.states.slice(size + 1), groups: row.groups.slice(1) }
}

function countFit(row: Row): number | undefined {
  if (row.groups.length === 0) {
    if (row.states.every((s) => s !== '#')) return 1
    return undefined
  }
  if (row.states.length === 0) return undefined
  const rows: Row[] = []
  const states = [...row.states]
  shift(states, '.')
  while (states.length > 0) {
    rows.push({ states: [...states], groups: [...row.groups] })
    if (states[0] === '#') break
    states.shift()
    shift(states, '.')
  }

  let counter: number | undefined = undefined
  for (row of rows) {
    const key = JSON.stringify(row)
    let count: number | undefined
    if (key in CACHE) {
      count = CACHE[key]
    } else {
      const fitRow = fitFirst(row)
      count = fitRow && countFit(fitRow)
      CACHE[key] = count
    }
    if (count !== undefined) counter = (counter ?? 0) + count
  }
  return counter
}

async function part1(lines: string[]) {
  let total = 0
  for (const line of lines) {
    const [statesStr, groupsStr] = line.split(' ')
    const row = {
      states: statesStr.split('') as State[],
      groups: groupsStr.split(',').map((s) => parseInt(s, 10)),
    }
    const count = countFit(row) ?? 0
    total += count
  }
  return total
}

async function part2(lines: string[]) {
  return part1(
    lines.map((line) => {
      const [statesStr, groupsStr] = line.split(' ')
      return (
        Array.from({ length: 5 }, () => statesStr).join('?') +
        ' ' +
        Array.from({ length: 5 }, () => groupsStr).join(',')
      )
    }),
  )
}

export default [part1, part2]
