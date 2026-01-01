function numDigits(n: number) {
  return Math.floor(Math.log10(n)) + 1
}

function isWeird1(n: number) {
  const nd = numDigits(n)
  if (nd % 2 === 1) return false
  const half = nd / 2
  const firstHalf = Math.floor(n / 10 ** half)
  const secondHalf = n % 10 ** half
  if (firstHalf === secondHalf) return true
}

function isWeird2(n: number) {
  const nd = numDigits(n)
  for (let size = 1; size <= nd / 2; size++) {
    if (nd % size !== 0) continue
    const base = 10 ** size
    let val = n
    const seen = val % base
    while (val > 0) {
      if (seen !== val % base) break
      val = Math.floor(val / base)
    }
    if (val === 0) return true
  }
  return false
}

function checkRange(from: number, to: number, part: number) {
  const isWeird = part === 1 ? isWeird1 : isWeird2
  let total = 0
  for (let i = from; i <= to; i++) if (isWeird(i)) total += i
  return total
}

function parse(line: string) {
  const ranges = line.split(',')
  return ranges.map((x) => {
    const [from, to] = x.split('-').map((y) => parseInt(y, 10))
    return [from, to]
  })
}

async function run(lines: string[], part: number) {
  const ranges = parse(lines[0])
  let total = 0
  for (const [from, to] of ranges) total += checkRange(from, to, part)
  return total
}

const part1 = async (lines: string[]) => run(lines, 1)
const part2 = async (lines: string[]) => run(lines, 2)

export default [part1, part2]
