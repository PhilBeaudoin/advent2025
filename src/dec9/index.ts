type Point = { x: number; y: number }

function parsePoints(lines: string[]): Point[] {
  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [x, y] = line.split(',').map((n) => parseInt(n, 10))
      return { x, y }
    })
}

function calculateArea(p1: Point, p2: Point): number {
  // Rectangle is inclusive of both corners
  // Even degenerate rectangles (lines) have valid area
  const width = Math.abs(p1.x - p2.x) + 1
  const height = Math.abs(p1.y - p2.y) + 1
  return width * height
}

async function findLargestRectangle(lines: string[]) {
  const points = parsePoints(lines)
  let maxArea = 0

  // Check all pairs of points
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const area = calculateArea(points[i], points[j])
      maxArea = Math.max(maxArea, area)
    }
  }

  return maxArea
}

// Part 2: New corner-based algorithm!

const DEBUG = false

type Direction = 'north' | 'south' | 'east' | 'west'

// Calculate polygon winding order (signed area)
// Note: Y axis points downward in this coordinate system
function isClockwise(polygon: Point[]): boolean {
  let sum = 0
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length
    sum += (polygon[next].x - polygon[i].x) * (polygon[next].y + polygon[i].y)
  }
  return sum < 0 // Flipped because Y points down
}

// Get edge direction [entering, exiting]
function getEdgeDirections(p1: Point, p2: Point): [Direction, Direction] {
  if (p1.x < p2.x) return ['west', 'east']
  if (p1.x > p2.x) return ['east', 'west']
  if (p1.y < p2.y) return ['north', 'south']
  if (p1.y > p2.y) return ['south', 'north']
  throw new Error('Invalid edge with identical points')
}

// Get notChill directions for a corner (in CW polygon)
// inDir/outDir are from the perspective of walking along the polygon
function getNotChillDirs(inDir: Direction, outDir: Direction): Direction[] {
  // Concave corners (turn right in CW) - all directions chill
  if (inDir === 'north' && outDir === 'west') return []
  if (inDir === 'west' && outDir === 'south') return []
  if (inDir === 'south' && outDir === 'east') return []
  if (inDir === 'east' && outDir === 'north') return []

  // Convex corners (turn left in CW) - directions to the left are notChill
  if (inDir === 'north' && outDir === 'east') return ['north', 'west']
  if (inDir === 'east' && outDir === 'south') return ['north', 'east']
  if (inDir === 'south' && outDir === 'west') return ['south', 'east']
  if (inDir === 'west' && outDir === 'north') return ['south', 'west']

  // Flat corners
  if (inDir === 'north' && outDir === 'north') return ['west']
  if (inDir === 'south' && outDir === 'south') return ['east']
  if (inDir === 'east' && outDir === 'east') return ['south']
  if (inDir === 'west' && outDir === 'west') return ['north']

  return [] // default
}

// Precompute notChill directions for each vertex
function precomputeNotChillDirs(polygon: Point[]): Direction[][] {
  const notChillDirs: Direction[][] = []

  if (DEBUG) {
    console.error('\n=== Precomputing notChillDirs ===')
  }

  for (let i = 0; i < polygon.length; i++) {
    const prev = (i - 1 + polygon.length) % polygon.length
    const next = (i + 1) % polygon.length

    const inEdgeDirs = getEdgeDirections(polygon[prev], polygon[i])
    const outEdgeDirs = getEdgeDirections(polygon[i], polygon[next])

    const inDir = inEdgeDirs[1] // where we're coming from (incoming edge's destination)
    const outDir = outEdgeDirs[1] // where we're going to (outgoing edge's destination)

    const notChill = getNotChillDirs(inDir, outDir)
    notChillDirs.push(notChill)

    if (DEBUG) {
      console.error(`Vertex ${i} (${polygon[i].x},${polygon[i].y}):`)
      console.error(`  prev=${prev} (${polygon[prev].x},${polygon[prev].y}) → curr, dirs=${JSON.stringify(inEdgeDirs)}`)
      console.error(`  curr → next=${next} (${polygon[next].x},${polygon[next].y}), dirs=${JSON.stringify(outEdgeDirs)}`)
      console.error(`  [inDir, outDir] = [${inDir}, ${outDir}]`)
      console.error(`  notChillDirs = [${notChill}]`)
    }
  }

  return notChillDirs
}

// Check if a rectangle side really crosses a polygon edge (strict inequalities)
function reallyCrosses(
  sideStart: Point,
  sideEnd: Point,
  edgeStart: Point,
  edgeEnd: Point,
): boolean {
  const sx1 = Math.min(sideStart.x, sideEnd.x)
  const sx2 = Math.max(sideStart.x, sideEnd.x)
  const sy1 = Math.min(sideStart.y, sideEnd.y)
  const sy2 = Math.max(sideStart.y, sideEnd.y)

  const ex1 = Math.min(edgeStart.x, edgeEnd.x)
  const ex2 = Math.max(edgeStart.x, edgeEnd.x)
  const ey1 = Math.min(edgeStart.y, edgeEnd.y)
  const ey2 = Math.max(edgeStart.y, edgeEnd.y)

  // Horizontal side vs vertical edge
  if (sy1 === sy2 && ex1 === ex2) {
    const sy = sy1
    const ex = ex1
    return sx1 < ex && ex < sx2 && ey1 < sy && sy < ey2
  }

  // Vertical side vs horizontal edge
  if (sx1 === sx2 && ey1 === ey2) {
    const sx = sx1
    const ey = ey1
    return sy1 < ey && ey < sy2 && ex1 < sx && sx < ex2
  }

  return false
}

// Get direction from one point to another
function getDirection(from: Point, to: Point): Direction | null {
  if (to.x > from.x) return 'east'
  if (to.x < from.x) return 'west'
  if (to.y > from.y) return 'south'
  if (to.y < from.y) return 'north'
  return null
}

// Part 2: Check if rectangle is valid using corner-based approach
function isRectangleValidPart2(
  a: Point,
  c: Point,
  polygon: Point[],
  notChillDirs: Direction[][],
): boolean {
  // Define rectangle sides as top, right, bottom, left
  const minX = Math.min(a.x, c.x)
  const maxX = Math.max(a.x, c.x)
  const minY = Math.min(a.y, c.y)
  const maxY = Math.max(a.y, c.y)

  const area = (maxX - minX + 1) * (maxY - minY + 1)

  if (DEBUG && area >= 24) {
    console.error(`\n=== Testing rectangle (${a.x},${a.y}) to (${c.x},${c.y}), area=${area} ===`)
  }

  const sides = [
    { name: 'top', start: { x: minX, y: minY }, end: { x: maxX, y: minY }, type: 'horizontal' as const, dirs: ['west', 'east'] as Direction[] },
    { name: 'right', start: { x: maxX, y: minY }, end: { x: maxX, y: maxY }, type: 'vertical' as const, dirs: ['north', 'south'] as Direction[] },
    { name: 'bottom', start: { x: maxX, y: maxY }, end: { x: minX, y: maxY }, type: 'horizontal' as const, dirs: ['east', 'west'] as Direction[] },
    { name: 'left', start: { x: minX, y: maxY }, end: { x: minX, y: minY }, type: 'vertical' as const, dirs: ['south', 'north'] as Direction[] },
  ]

  // Check each rectangle side
  for (const side of sides) {
    // Check if side really crosses any polygon edge
    for (let i = 0; i < polygon.length; i++) {
      const next = (i + 1) % polygon.length
      if (reallyCrosses(side.start, side.end, polygon[i], polygon[next])) {
        if (DEBUG && area >= 24) {
          console.error(`  REJECT: ${side.name} side really crosses edge ${i}→${next}`)
        }
        return false // really crossed an edge!
      }
    }

    // Check if side exits through any vertex in a notChill direction
    for (let i = 0; i < polygon.length; i++) {
      const vertex = polygon[i]
      const notChill = notChillDirs[i]
      if (notChill.length === 0) continue // concave corner, always chill

      // Check if vertex is on this side
      let onSide = false
      let atStart = false
      let atEnd = false

      if (side.type === 'horizontal') {
        onSide = vertex.y === side.start.y &&
                 minX <= vertex.x && vertex.x <= maxX
        atStart = vertex.x === side.start.x && vertex.y === side.start.y
        atEnd = vertex.x === side.end.x && vertex.y === side.end.y
      } else {
        onSide = vertex.x === side.start.x &&
                 minY <= vertex.y && vertex.y <= maxY
        atStart = vertex.x === side.start.x && vertex.y === side.start.y
        atEnd = vertex.x === side.end.x && vertex.y === side.end.y
      }

      if (!onSide) continue

      if (DEBUG && area >= 24) {
        console.error(`  ${side.name} side touches vertex ${i} (${vertex.x},${vertex.y}), notChill=[${notChill}]`)
        console.error(`    atStart=${atStart}, atEnd=${atEnd}, dirs=[${side.dirs}]`)
      }

      // Check relevant directions
      if (atStart) {
        // At start: check forward direction only
        if (notChill.includes(side.dirs[1])) {
          if (DEBUG && area >= 24) {
            console.error(`    REJECT: forward dir ${side.dirs[1]} is notChill`)
          }
          return false
        }
      } else if (atEnd) {
        // At end: check backward direction only
        if (notChill.includes(side.dirs[0])) {
          if (DEBUG && area >= 24) {
            console.error(`    REJECT: backward dir ${side.dirs[0]} is notChill`)
          }
          return false
        }
      } else {
        // In middle: check both directions
        if (notChill.includes(side.dirs[0]) || notChill.includes(side.dirs[1])) {
          if (DEBUG && area >= 24) {
            console.error(`    REJECT: middle, one of [${side.dirs}] is notChill`)
          }
          return false
        }
      }
    }
  }

  if (DEBUG && area >= 24) {
    console.error(`  ✓ ACCEPT!`)
  }

  return true
}

async function findLargestValidRectangle(lines: string[]) {
  let points = parsePoints(lines)

  // Ensure polygon is clockwise
  if (!isClockwise(points)) {
    points = points.reverse()
  }

  // Precompute notChill directions for each vertex
  const notChillDirs = precomputeNotChillDirs(points)

  let maxArea = 0

  // Check all pairs of red tiles
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (isRectangleValidPart2(points[i], points[j], points, notChillDirs)) {
        const area = calculateArea(points[i], points[j])
        maxArea = Math.max(maxArea, area)
      }
    }
  }

  return maxArea
}

const part1 = async (lines: string[]) => findLargestRectangle(lines)
const part2 = async (lines: string[]) => findLargestValidRectangle(lines)

export default [part1, part2]
