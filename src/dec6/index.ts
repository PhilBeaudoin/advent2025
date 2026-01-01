interface Op {
  nums: number[]
  op: '*' | '+'
}

function parseOps1(lines: string[]): Op[] {
  // Pop last line, with operations
  const lastLine = lines.pop()?.trim().split(/\s+/) as ('*' | '+')[]
  const ops: Op[] = lastLine.map((op) => ({ nums: [], op }))
  for (const line of lines) {
    const parts = line
      .trim()
      .split(/\s+/)
      .map((x) => parseInt(x, 10))
    for (const [i, part] of parts.entries()) ops[i].nums.push(part)
  }
  return ops
}

function parseOps2(lines: string[]): Op[] {
  const ops: Op[] = []
  const length = lines.reduce((max, line) => Math.max(max, line.length), 0)
  const nLines = lines.length
  const opsLine = lines[nLines - 1]
  for (let i = 0; i < length; i++) {
    const op = i >= opsLine.length ? ' ' : lines[nLines - 1][i]
    if (op !== ' ') ops.push({ nums: [], op: op as '*' | '+' })
    let digit = 0
    let val = 0
    for (let j = nLines - 2; j >= 0; j--) {
      const char = i >= lines[j].length ? ' ' : lines[j][i]
      if (char === ' ') continue
      val += parseInt(char, 10) * 10 ** digit
      digit++
    }
    if (val > 0) ops[ops.length - 1].nums.push(val)
  }
  return ops
}

async function run(lines: string[], part: number) {
  const ops = part === 1 ? parseOps1(lines) : parseOps2(lines)
  let result = 0
  for (const op of ops) {
    const opResult =
      op.op === '*'
        ? op.nums.reduce((acc, n) => acc * n, 1)
        : op.nums.reduce((acc, n) => acc + n, 0)
    result += opResult
  }
  return result
}

const part1 = async (lines: string[]) => run(lines, 1)
const part2 = async (lines: string[]) => run(lines, 2)

export default [part1, part2]
