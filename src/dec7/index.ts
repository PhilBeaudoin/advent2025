const values = '*23456789TJQKA'
const hands = [
  'high card',
  'one pair',
  'two pair',
  'three of a kind',
  'full house',
  'four of a kind',
  'five of a kind',
]

type HandType = (typeof hands)[number]

interface Hand {
  cards: string
  bid: number
  handType: HandType
  handScore: number
}

function sortCards(cards: string): string {
  return [...cards]
    .sort((a, b) => values.indexOf(a) - values.indexOf(b))
    .join('')
}

function calcHandType(cards: string): HandType {
  const sortedCards = sortCards(cards)
  const counts: number[] = []
  let last = ''
  let count = 0
  for (const card of sortedCards) {
    if (card !== last) {
      if (count > 0) counts.push(count)
      count = 0
      last = card
    }
    count++
  }
  counts.push(count)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const numJokers = sortedCards[0] === '*' ? counts.shift()! : 0
  counts.sort((a, b) => b - a)
  if (counts.length === 0) {
    counts.push(numJokers)
  } else {
    counts[0] += numJokers
  }
  if (counts[0] === 5) return 'five of a kind'
  if (counts[0] === 4) return 'four of a kind'
  if (counts[0] === 3 && counts[1] === 2) return 'full house'
  if (counts[0] === 3) return 'three of a kind'
  if (counts[0] === 2 && counts[1] === 2) return 'two pair'
  if (counts[0] === 2) return 'one pair'
  return 'high card'
}

function calcHandScore(cards: string, handType: HandType): number {
  let mult = Math.pow(values.length, cards.length)
  let score = mult * hands.indexOf(handType)
  while (cards.length > 0) {
    const card = cards[0]
    mult /= values.length
    score += values.indexOf(card) * mult
    cards = cards.slice(1)
  }
  return score
}

function calcHand(cards: string, bidStr: string): Hand {
  const bid = parseInt(bidStr, 10)
  const handType = calcHandType(cards)
  const handScore = calcHandScore(cards, handType)
  return { cards, bid, handType, handScore }
}

async function part1(lines: string[]) {
  const hands: Hand[] = []
  for (const line of lines) {
    const [cards, bidStr] = line.split(/\s+/)
    hands.push(calcHand(cards, bidStr))
  }
  hands.sort((a, b) => a.handScore - b.handScore)
  return hands.reduce((acc, hand, i) => acc + hand.bid * (i + 1), 0)
}

async function part2(lines: string[]) {
  const hands: Hand[] = []
  for (const line of lines) {
    const [cards, bidStr] = line.split(/\s+/)
    hands.push(calcHand(cards.replace(/J/g, '*'), bidStr))
  }
  hands.sort((a, b) => a.handScore - b.handScore)
  return hands.reduce((acc, hand, i) => acc + hand.bid * (i + 1), 0)
}

export default [part1, part2]
