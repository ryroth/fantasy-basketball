import { weeklyStats } from './stats.js'

export function fantasyPoints(stats, scoring) {
  if (!stats || !scoring) {
    return 0
  }

  let total = 0

  for (const [stat, weight] of Object.entries(scoring)) {
    const amount = Number(stats[stat]) || 0
    total += amount * Number(weight)
  }

  return total
}

export function playerPoints(playerId, scoring) {
  return fantasyPoints(weeklyStats[playerId], scoring)
}

export function starterPoints(roster, scoring) {
  return roster
    .filter((slot) => slot.status === 'starter')
    .reduce((total, slot) => total + playerPoints(slot.id, scoring), 0)
}

export function formatPoints(value) {
  return value.toFixed(1)
}

export function scoringBreakdown(stats, scoring) {
  if (!stats || !scoring) {
    return []
  }

  return Object.entries(scoring).map(([stat, weight]) => {
    const amount = Number(stats[stat]) || 0
    const value = Number(weight)
    return {
      stat,
      amount,
      weight: value,
      points: amount * value,
    }
  })
}

function rowWinner(stat, left, right) {
  if (left == null || right == null || left === right) {
    return 'tie'
  }

  if (stat === 'TO') {
    return left < right ? 'left' : 'right'
  }

  return left > right ? 'left' : 'right'
}

export function comparePlayers(leftId, rightId, scoring) {
  const leftStats = weeklyStats[leftId]
  const rightStats = weeklyStats[rightId]
  const leftPoints = playerPoints(leftId, scoring)
  const rightPoints = playerPoints(rightId, scoring)
  const rows = [
    {
      stat: 'FPTS',
      label: 'Fantasy pts',
      left: leftStats ? leftPoints : null,
      right: rightStats ? rightPoints : null,
      winner: rowWinner('FPTS', leftStats ? leftPoints : null, rightStats ? rightPoints : null),
    },
  ]

  for (const stat of Object.keys(scoring)) {
    const left = leftStats ? Number(leftStats[stat]) || 0 : null
    const right = rightStats ? Number(rightStats[stat]) || 0 : null
    rows.push({
      stat,
      label: stat,
      left,
      right,
      winner: rowWinner(stat, left, right),
    })
  }

  return { leftPoints, rightPoints, rows }
}
