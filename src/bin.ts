import minimist from 'minimist'
import fs from 'fs-extra'
import { findLargestDay } from './files'

type Func = (lines: string[]) => Promise<any>

const argv = minimist(process.argv.slice(2))
const day = parseInt(argv._[0], 10)
const part = argv['1'] ? 1 : argv['2'] ? 2 : 0
const file = argv.ex ? `example` : `input`

async function run() {
  const maxDay = await findLargestDay()

  if (isNaN(day) || day < 1 || day > maxDay || part === 0) {
    console.error('Usage: pnpm start DAY [-1 | -2] [--ex]')
    console.error(`DAY must be between 1 and ${maxDay}`)
    process.exit(1)
  }

  const parts = (await import(`./dec${day}`)).default as [Func, Func]
  let path = `./src/dec${day}/${file}`
  if (await fs.pathExists(path + `${part}.txt`)) path += `${part}.txt`
  else path += `.txt`
  const input = await fs.readFile(path, 'utf8')
  const lines = input.split('\n')
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()

  console.log(`Result: `, await parts[part - 1](lines))
}

run()
