function diffs(numbers: number[]): number[] {
  const result: number[] = []
  for (let i = 1; i < numbers.length; i++)
    result.push(numbers[i] - numbers[i - 1])
  return result
}

function allDiffs(numbers: number[]): number[][] {
  const result = [[...numbers]]
  while (result[result.length - 1].some((v) => v !== 0)) {
    result.push(diffs(result[result.length - 1]))
  }
  return result
}

function extrapolate(diffs: number[][]) {
  diffs[diffs.length - 1].push(0)
  for (let i = diffs.length - 2; i >= 0; i--) {
    diffs[i].push(
      diffs[i][diffs[i].length - 1] + diffs[i + 1][diffs[i + 1].length - 1],
    )
  }
}

function extrapolateBack(diffs: number[][]) {
  diffs[diffs.length - 1].unshift(0)
  for (let i = diffs.length - 2; i >= 0; i--) {
    diffs[i].unshift(diffs[i][0] - diffs[i + 1][0])
  }
}

async function part1(lines) {
  let sum = 0
  for (const line of lines) {
    const numbers = line.split(/\s+/).map((v) => parseInt(v, 10))
    const diffs = allDiffs(numbers)
    extrapolate(diffs)
    sum += diffs[0][diffs[0].length - 1]
  }
  return sum
}

async function part2(lines) {
  let sum = 0
  for (const line of lines) {
    const numbers = line.split(/\s+/).map((v) => parseInt(v, 10))
    const diffs = allDiffs(numbers)
    extrapolateBack(diffs)
    sum += diffs[0][0]
  }
  return sum
}

export default [part1, part2]
