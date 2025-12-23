import * as fs from 'fs/promises'

export async function findLargestDay() {
  const folders = await fs.readdir('./src')
  const days = folders
    .filter((f) => f.startsWith('dec'))
    .map((f) => parseInt(f.slice(3), 10))
  return Math.max(...days)
}
