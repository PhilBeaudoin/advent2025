function hashString(s: string): number {
  let currVal = 0
  for (const c of s) {
    currVal += c.charCodeAt(0)
    currVal *= 17
    currVal = currVal % 256
  }
  return currVal
}

async function part1(lines: string[]) {
  const seq = lines[0].split(',')
  return seq.reduce((acc, cur) => acc + hashString(cur), 0)
}

interface Lens {
  label: string
  power: number
}

type Box = Lens[]

function boxScore(box: Box): number {
  return box.reduce((acc, cur, i) => acc + (i + 1) * cur.power, 0)
}

function removeFromBox(box: Box, label: string): Box {
  return box.filter((lens) => lens.label !== label)
}

function addOrSetLense(box: Box, label: string, power: number): Box {
  const lens = box.find((lens) => lens.label === label)
  if (lens) {
    lens.power = power
    return box
  }
  return [...box, { label, power }]
}

async function part2(lines: string[]) {
  const boxes: Box[] = Array.from({ length: 256 }, () => [])
  const seq = lines[0].split(',')
  for (const op of seq) {
    if (op.endsWith('-')) {
      const label = op.slice(0, -1)
      const hash = hashString(label)
      boxes[hash] = removeFromBox(boxes[hash], label)
    } else {
      const [label, powerStr] = op.split('=')
      const power = parseInt(powerStr)
      const hash = hashString(label)
      boxes[hash] = addOrSetLense(boxes[hash], label, power)
    }
  }
  return boxes.reduce((acc, box, i) => acc + (i + 1) * boxScore(box), 0)
}

export default [part1, part2]
