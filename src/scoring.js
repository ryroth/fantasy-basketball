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
