const REPEAT = 1000
const DEBUG = false

type PulseType = 'low' | 'high'

type ModuleType = 'broadcaster' | 'flipflop' | 'conjunction'

type Modules = { [name: string]: Module }

interface Module {
  readonly type: ModuleType
  readonly name: string
  readonly destinationModules: string[]
  addInput(name: string): void
  process(pulseType: PulseType, from: string): Pulse[]
}

interface Pulse {
  type: PulseType
  from: string
  dest: string
}

function printPulse(pulse: Pulse) {
  console.log(`${pulse.from} -${pulse.type}-> ${pulse.dest}`)
}

class Broadcaster implements Module {
  readonly type = 'broadcaster'
  readonly name = 'broadcaster'
  constructor(public readonly destinationModules: string[]) {}
  addInput(_: string) {}
  process(pulseType: PulseType, _from: string) {
    return this.destinationModules.map((name) => ({
      type: pulseType,
      from: this.name,
      dest: name,
    }))
  }
}

class FlipFlop implements Module {
  readonly type = 'flipflop'
  private state: 'on' | 'off' = 'off'

  constructor(
    public readonly name: string,
    public readonly destinationModules: string[],
  ) {}

  addInput(_: string) {}
  process(pulseType: PulseType, _from: string) {
    if (pulseType === 'high') return []
    this.state = this.state === 'on' ? 'off' : 'on'
    const type: PulseType = this.state === 'on' ? 'high' : 'low'
    return this.destinationModules.map((name) => ({
      type,
      from: this.name,
      dest: name,
    }))
  }
}

class Conjunction implements Module {
  readonly type = 'conjunction'
  private inputs: { [name: string]: PulseType } = {}

  constructor(
    public readonly name: string,
    public readonly destinationModules: string[],
  ) {}

  addInput(name: string) {
    this.inputs[name] = 'low'
  }

  process(pulseType: PulseType, from: string) {
    if (!(from in this.inputs)) throw new Error(`Unknown input ${from}`)
    this.inputs[from] = pulseType
    const type: PulseType = Object.values(this.inputs).some((v) => v === 'low')
      ? 'high'
      : 'low'
    return this.destinationModules.map((name) => ({
      type,
      from: this.name,
      dest: name,
    }))
  }
}

function readModule(line: string): Module {
  // eslint-disable-next-line prefer-const
  let [name, destinationsStr] = line.split(' -> ')
  let type: ModuleType = 'broadcaster'
  if (name.startsWith('%')) type = 'flipflop'
  else if (name.startsWith('&')) type = 'conjunction'
  if (type !== 'broadcaster') name = name.slice(1)
  const destinationModules = destinationsStr.split(', ')

  switch (type) {
    case 'broadcaster':
      return new Broadcaster(destinationModules)
    case 'flipflop':
      return new FlipFlop(name, destinationModules)
    case 'conjunction':
      return new Conjunction(name, destinationModules)
  }
}

function readModules(lines: string[]): Modules {
  const modules: Modules = {}
  for (const line of lines) {
    const module = readModule(line)
    modules[module.name] = module
  }
  for (const module of Object.values(modules)) {
    for (const name of module.destinationModules)
      if (name in modules) modules[name].addInput(module.name)
  }
  return modules
}

function pressButton(modules: Modules) {
  let numLow = 0
  let numHigh = 0
  let rxLow = false
  const pulses: Pulse[] = [{ type: 'low', from: 'button', dest: 'broadcaster' }]
  while (pulses.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pulse = pulses.shift()!
    if (DEBUG) printPulse(pulse)
    if (pulse.type === 'low') numLow++
    else numHigh++
    if (pulse.dest === 'rx' && pulse.type === 'low') rxLow = true
    if (pulse.dest in modules)
      pulses.push(...modules[pulse.dest].process(pulse.type, pulse.from))
  }
  return { numLow, numHigh, rxLow }
}

async function part1(lines: string[]) {
  const modules = readModules(lines)
  let numLow = 0
  let numHigh = 0
  for (let i = 0; i < REPEAT; i++) {
    if (DEBUG) console.log('')
    const { numLow: nl, numHigh: nh } = pressButton(modules)
    numLow += nl
    numHigh += nh
  }
  return numLow * numHigh
}

async function part2(lines: string[]) {
  const modules = readModules(lines)
  let i = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    i++
    if (DEBUG) console.log('')
    const { rxLow } = pressButton(modules)
    if (rxLow) return i
  }
}

export default [part1, part2]
