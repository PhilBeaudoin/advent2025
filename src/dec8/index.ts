const lineRe = /^([A-Z0-9]+) = \(([A-Z0-9]+), ([A-Z0-9]+)\)$/g

type Nodes = { [key: string]: { L: string; R: string } }

function gcd(a: number, b: number) {
  // Compute the greatest common divisor using Euclidean algorithm
  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

function lcm(numbers: number[]) {
  if (numbers.length === 0) return null
  let result = numbers[0]
  for (let i = 1; i < numbers.length; i++)
    result = (result * numbers[i]) / gcd(result, numbers[i])
  return result
}

function readInput(lines: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rules = lines.shift()!
  lines.shift()
  let line: string | undefined
  const nodes: Nodes = {}
  while ((line = lines.shift()) !== undefined) {
    const [, node, L, R] = [...line.matchAll(lineRe)][0]
    nodes[node] = { L, R }
  }
  return { rules, nodes }
}

function dist(
  start: string,
  ends: string[],
  rules: string,
  nodes: Nodes,
): number[] {
  const result: number[] = []
  for (const end of ends) {
    let count = 0
    let curr = start
    const visited = new Set<string>()
    while (curr !== end) {
      const i = count % rules.length
      const key = `${curr}:${i}`
      if (visited.has(key)) {
        count = Infinity
        break
      }
      visited.add(key)
      curr = nodes[curr][rules[i]]
      count++
    }
    result.push(count)
  }
  return result
}

async function part1(lines: string[]) {
  const { rules, nodes } = readInput(lines)
  return dist('AAA', ['ZZZ'], rules, nodes)[0]
}

async function part2(lines: string[]) {
  const { rules, nodes } = readInput(lines)
  const starts = Object.keys(nodes).filter((k) => k.endsWith('A'))
  const ends = Object.keys(nodes).filter((k) => k.endsWith('Z'))
  const dists = starts.flatMap((k) =>
    dist(k, ends, rules, nodes).filter((d) => d !== Infinity),
  )
  return lcm(dists)
}

export default [part1, part2]
