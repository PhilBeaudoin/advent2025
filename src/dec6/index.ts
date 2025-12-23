function roots(duration: number, record: number) {
  const a = -1
  const b = duration
  const c = -record
  const d = Math.sqrt(b * b - 4 * a * c)
  return [Math.floor((-b + d) / (2 * a)) + 1, Math.ceil((-b - d) / (2 * a)) - 1]
}

async function part1(lines: string[]) {
  const durations = lines[0].split(/\s+/).map((v) => parseInt(v, 10))
  durations.shift()
  const records = lines[1].split(/\s+/).map((v) => parseInt(v, 10))
  records.shift()
  let numWays = 1
  for (let i = 0; i < durations.length; i++) {
    const [start, end] = roots(durations[i], records[i])
    numWays *= end - start + 1
  }
  return numWays
}

async function part2(lines: string[]) {
  const durations = lines[0].split(/\s+/)
  durations.shift()
  const duration = parseInt(durations.join(''), 10)
  const records = lines[1].split(/\s+/).map((v) => parseInt(v, 10))
  records.shift()
  const record = parseInt(records.join(''), 10)
  const [start, end] = roots(duration, record)
  return end - start + 1
}

export default [part1, part2]
