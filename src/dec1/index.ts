const regExp = /^([RL])([0-9]+)$/g

function clamp(n: number) {
  n %= 100
  return n < 0 ? n + 100 : n
}

async function countZeroes(lines: string[], part: number) {
  const res = lines.reduce(
    ([acc, numZeroes], line) => {
      const [_, dir, num] = [...line.matchAll(regExp)][0]
      let out = acc + parseInt(num, 10) * (dir === 'R' ? 1 : -1)
      if (part === 1) {
        out = clamp(out)
        return [out, numZeroes + (out === 0 ? 1 : 0)]
      }
      let numCrossings = Math.abs(Math.floor(out / 100))
      out = clamp(out)
      if (dir === 'L' && out === 0) numCrossings += 1
      if (dir === 'L' && acc === 0) numCrossings -= 1
      console.error(line, { dir, num, out, numCrossings })
      return [out, numZeroes + numCrossings]
    },
    [50, 0],
  )
  return res[1]
}

const part1 = async (lines: string[]) => countZeroes(lines, 1)
const part2 = async (lines: string[]) => countZeroes(lines, 2)

export default [part1, part2]
