function findLargest(
  line: string,
  startAt: number,
  digitsLeft: number,
): [number, string] {
  // Find the largest digit in the line
  let [i, v] = [startAt, line[startAt]]
  for (let j = startAt; j <= line.length - digitsLeft; j++)
    if (line[j] > v) [i, v] = [j, line[j]]
  return [i, v]
}

function largestJoltage(line: string, digits: number) {
  // Remove last character (newline)
  let acc = 0
  let i = 0
  for (let d = digits; d >= 1; d--) {
    acc *= 10
    const [j, v] = findLargest(line, i, d)
    i = j + 1
    acc += parseInt(v, 10)
  }
  return acc
}

async function part1(lines: string[]) {
  return lines.reduce((acc, line) => acc + largestJoltage(line, 2), 0)
}

async function part2(lines: string[]) {
  return lines.reduce((acc, line) => acc + largestJoltage(line, 12), 0)
}

export default [part1, part2]
