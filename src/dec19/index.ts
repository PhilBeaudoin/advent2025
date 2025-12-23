import {
  NumRange,
  rangeIntersection,
  rangesLength,
  sliceRanges,
} from '../ranges'

const CATS = ['x', 'm', 'a', 's'] as const
const RESULTS = ['A', 'R'] as const

type Cat = (typeof CATS)[number]
type Result = (typeof RESULTS)[number]
type Op = '<' | '>'

interface Predicate {
  cat: Cat
  op: Op
  val: number
}

interface Rule {
  predicate?: Predicate
  outcome: string
}

type Workflows = { [name: string]: Rule[] }

type Part = { [cat in Cat]: number }

type PartRange = { [cat in Cat]: NumRange[] }

const EMPTY_PART_RANGE: PartRange = {
  x: [],
  m: [],
  a: [],
  s: [],
}

function parseRule(ruleStr: string): Rule {
  const [_, cat, op, val, outcome] =
    /^(\w)([<>])(\d+):(.*)$/.exec(ruleStr) ?? []
  if (cat === undefined) return { outcome: ruleStr }
  const predicate = { cat: cat as Cat, op: op as Op, val: parseInt(val, 10) }
  return { predicate, outcome }
}

function parseWorkflow(line: string, workflows: Workflows) {
  const [_, name, rulesStr] = /^(.*)\{(.*)\}$/.exec(line) ?? []
  const rules = rulesStr.split(',').map(parseRule)
  workflows[name] = rules
}

function parsePart(line: string): Part {
  const part: Part = { x: 0, m: 0, a: 0, s: 0 }
  CATS.forEach((cat) => {
    const [_, val] = new RegExp(`${cat}=(\\d+)`).exec(line) ?? []
    part[cat] = parseInt(val, 10)
  })
  return part
}

function readFile(lines: string[]): { workflows: Workflows; parts: Part[] } {
  const workflows: Workflows = {}
  const parts: Part[] = []

  let isWorkflow = true
  for (const line of lines) {
    if (line === '') {
      isWorkflow = false
      continue
    }
    if (isWorkflow) parseWorkflow(line, workflows)
    else parts.push(parsePart(line))
  }
  return { workflows, parts }
}

function applyRule(part: Part, rule: Rule): string | undefined {
  if (rule.predicate === undefined) return rule.outcome
  const { cat, op, val } = rule.predicate
  switch (op) {
    case '<':
      return part[cat] < val ? rule.outcome : undefined
    case '>':
      return part[cat] > val ? rule.outcome : undefined
  }
}

function applyRules(part: Part, rules: Rule[]): string {
  for (const rule of rules) {
    const outcome = applyRule(part, rule)
    if (outcome !== undefined) return outcome
  }
  throw new Error('No outcome found')
}

function applyWorkflow(part: Part, workflows: Workflows): Result {
  let workflow: Rule[] = workflows['in']
  let outcome: string | undefined
  // eslint-disable-next-line no-constant-condition
  while (true) {
    outcome = applyRules(part, workflow)
    if (RESULTS.includes(outcome as Result)) return outcome as Result
    workflow = workflows[outcome]
  }
}

interface CatRange {
  cat: Cat
  range: NumRange
}

function countParts(partRange: PartRange): number {
  return (
    rangesLength(partRange.x) *
    rangesLength(partRange.m) *
    rangesLength(partRange.a) *
    rangesLength(partRange.s)
  )
}

function partRangeIntersection(
  partRange1: PartRange,
  partRange2: PartRange,
): PartRange {
  const result = EMPTY_PART_RANGE
  CATS.forEach((cat) => {
    result[cat] = rangeIntersection(partRange1[cat], partRange2[cat])
  })
  return result
}

function slicePartRange(
  partRange: PartRange,
  sliceOff: CatRange,
): { sliced: PartRange; remainder: PartRange } {
  const cat = sliceOff.cat
  const { sliced: slicedRanges, remainder: remainderRanges } = sliceRanges(
    partRange[cat],
    sliceOff.range,
  )
  const sliced = { ...partRange, [cat]: slicedRanges }
  const remainder = { ...partRange, [cat]: remainderRanges }
  return { sliced, remainder }
}

function applyRuleToRange(
  partRange: PartRange,
  rule: Rule,
): { accepted: PartRange; rejected: PartRange; outcome: string } {
  if (rule.predicate === undefined) {
    const accepted = rule.outcome === 'R' ? EMPTY_PART_RANGE : partRange
    return {
      accepted,
      rejected: EMPTY_PART_RANGE,
      outcome: rule.outcome,
    }
  }
  const { cat, op, val } = rule.predicate
  let result: { sliced: PartRange; remainder: PartRange }
  switch (op) {
    case '<':
      result = slicePartRange(partRange, { cat, range: { min: 1, max: val } })
      break
    case '>':
      result = slicePartRange(partRange, {
        cat,
        range: { min: val + 1, max: 4001 },
      })
      break
  }
  const { sliced, remainder } = result
  return { accepted: sliced, rejected: remainder, outcome: rule.outcome }
}

type OutcomeToPartRanges = { [outcome: string]: PartRange[] }

function applyRulesToRange(
  partRange: PartRange,
  rules: Rule[],
): OutcomeToPartRanges {
  const result: OutcomeToPartRanges = {}
  let remainder = { ...partRange }
  for (const rule of rules) {
    const { accepted, rejected, outcome } = applyRuleToRange(remainder, rule)
    result[outcome] = result[outcome] ?? []
    result[outcome].push(accepted)
    remainder = rejected
  }
  return result
}

function applyWorkflowToRange(
  partRange: PartRange,
  workflows: Workflows,
): number {
  const toProcess: OutcomeToPartRanges = { in: [partRange] }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const keys = Object.keys(toProcess).filter(
      (key) => key !== 'A' && key !== 'R',
    )
    if (keys.length === 0) break
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const partRange = toProcess[keys[0]].shift()!
    if (toProcess[keys[0]].length === 0) delete toProcess[keys[0]]
    const result = applyRulesToRange(partRange, workflows[keys[0]])
    Object.keys(result).forEach((key) => {
      toProcess[key] = toProcess[key] ?? []
      toProcess[key].push(...result[key])
    })
  }

  const partRanges = toProcess['A']
  let totalParts = 0
  for (const partRange of partRanges) totalParts += countParts(partRange)

  for (let i = 0; i < partRanges.length; i++) {
    for (let j = i + 1; j < partRanges.length; j++) {
      const intersection = partRangeIntersection(partRanges[i], partRanges[j])
      totalParts -= countParts(intersection)
    }
  }

  return totalParts
}

function calcPartRating(part: Part): number {
  return CATS.reduce((acc, cat) => acc + part[cat], 0)
}

function calcRating(parts: Part[]): number {
  return parts.reduce((acc, part) => acc + calcPartRating(part), 0)
}

async function part1(lines: string[]) {
  const { workflows, parts } = readFile(lines)
  const accepted = parts.filter(
    (part) => applyWorkflow(part, workflows) === 'A',
  )
  return calcRating(accepted)
}

async function part2(lines: string[]) {
  const { workflows } = readFile(lines)

  const partRange: PartRange = {
    x: [{ min: 1, max: 4001 }],
    m: [{ min: 1, max: 4001 }],
    a: [{ min: 1, max: 4001 }],
    s: [{ min: 1, max: 4001 }],
  }
  return applyWorkflowToRange(partRange, workflows)
}
export default [part1, part2]
