import { DIRS, Dir, flipDir, move, rotateCCW, rotateCW } from '../dir'
import { inBounds, initMatrix, matrixSize } from '../matrix'
import { Pos } from '../pos'
import { PriorityQueue } from '@js-sdsl/priority-queue'

type Map = number[][]

function readMap(lines: string[]): Map {
  return lines.map((line) => line.split('').map((char) => parseInt(char, 10)))
}

interface Move {
  pos: Pos
  dir: Dir
  dist: number
  loss: number
}

type DirToBestMove = Partial<{ [key in Dir]: Move }>
type PosDirToBestMove = DirToBestMove[][]

function bestInitialLoss(posDirToBestMove: PosDirToBestMove): number {
  return Math.min(
    posDirToBestMove[0][0].e?.loss ?? Infinity,
    posDirToBestMove[0][0].s?.loss ?? Infinity,
  )
}

function calcBestMoves(
  map: Map,
  minMoves: number,
  maxMoves: number,
): PosDirToBestMove {
  const { width, height } = matrixSize(map)
  const destPos = { x: width - 1, y: height - 1 }
  const result: PosDirToBestMove = initMatrix({ width, height }, () => ({}))

  const toProcess = new PriorityQueue<Move>([], (a, b) => a.loss - b.loss)
  for (const dir of DIRS) {
    const move: Move = { pos: destPos, dir, dist: 0, loss: 0 }
    result[destPos.y][destPos.x][dir] = move
    toProcess.push(move)
  }

  while (toProcess.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { pos, dir, loss } = toProcess.pop()!
    if (loss > bestInitialLoss(result)) break

    const dirs = [rotateCCW(dir), rotateCW(dir)]
    for (const nextDir of dirs) {
      let cost = loss + map[pos.y][pos.x]
      for (let nextDist = 1; nextDist <= maxMoves; ++nextDist) {
        const nextMove = {
          pos: move(pos, nextDir, nextDist),
          dir: flipDir(nextDir),
          dist: nextDist,
          loss: cost,
        }
        if (!inBounds(nextMove.pos, map)) break
        if (nextDist >= minMoves) {
          const currBestMove =
            result[nextMove.pos.y][nextMove.pos.x][nextMove.dir]
          if (cost < (currBestMove?.loss ?? Infinity)) {
            result[nextMove.pos.y][nextMove.pos.x][nextMove.dir] = nextMove
            toProcess.push(nextMove)
          }
        }
        cost += map[nextMove.pos.y][nextMove.pos.x]
      }
    }
  }
  return result
}

function printLosses(posDirToBestMove: PosDirToBestMove) {
  for (const row of posDirToBestMove) {
    for (const dirToBestMove of row) {
      let bestMove: Move | undefined
      for (const dir of DIRS) {
        const move = dirToBestMove[dir]
        if (move && move.loss < (bestMove?.loss ?? Infinity)) bestMove = move
      }
      if (!bestMove) process.stdout.write('??')
      else process.stdout.write(bestMove.dir + bestMove.dist.toString())
    }
    process.stdout.write('\n')
  }
}

async function part1(lines: string[]) {
  const result = calcBestMoves(readMap(lines), 1, 3)
  return bestInitialLoss(result)
}

async function part2(lines: string[]) {
  const result = calcBestMoves(readMap(lines), 4, 10)
  return bestInitialLoss(result)
}

export default [part1, part2]
