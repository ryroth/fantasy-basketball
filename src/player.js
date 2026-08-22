import { league } from './league.js'
import { playersById } from './players.js'
import {
  BENCH_LIMIT,
  ROSTER_LIMIT,
  STARTER_LIMIT,
  findSlot,
  lineupCounts,
} from './roster.js'
import {
  formatPoints,
  playerPoints,
  scoringBreakdown,
} from './scoring.js'
import { weeklyStats } from './stats.js'

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function rosterStatusLabel(slot) {
  if (!slot) {
    return 'Available'
  }

  return slot.status === 'starter' ? 'Starter on your roster' : 'Benched on your roster'
}

function actionButtons(playerId, roster) {
  const slot = findSlot(roster, playerId)
  const counts = lineupCounts(roster)

  if (!slot) {
    const full = roster.length >= ROSTER_LIMIT
    return `
      <button type="button" class="add" data-add="${playerId}"${full ? ' disabled' : ''}>
        Add to roster
      </button>
    `
  }

  const isStarter = slot.status === 'starter'
  const moveStatus = isStarter ? 'bench' : 'starter'
  const moveLabel = isStarter ? 'Move to bench' : 'Move to start'
  const moveBlocked = isStarter
    ? counts.bench >= BENCH_LIMIT
    : counts.starters >= STARTER_LIMIT

  return `
    <button
      type="button"
      class="move"
      data-lineup="${moveStatus}"
      data-player="${playerId}"
      ${moveBlocked ? 'disabled' : ''}
    >
      ${moveLabel}
    </button>
    <button type="button" class="remove" data-remove="${playerId}">
      Remove
    </button>
  `
}

function boxScoreHtml(playerId) {
  const stats = weeklyStats[playerId]

  if (!stats) {
    return `
      <p class="recipe-note">
        We do not have a box score for this player, so the app will not invent
        one.
      </p>
    `
  }

  const breakdown = scoringBreakdown(stats, league.scoring)
  const statCells = breakdown
    .map(
      (row) => `
        <div>
          <dt>${escapeHtml(row.stat)}</dt>
          <dd>${row.amount}</dd>
        </div>
      `,
    )
    .join('')

  const mathRows = breakdown
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.stat)}</td>
          <td>${row.amount}</td>
          <td>${row.weight}</td>
          <td class="points">${formatPoints(row.points)}</td>
        </tr>
      `,
    )
    .join('')

  return `
    <h3>This week's box score</h3>
    <dl class="recipe-grid">
      ${statCells}
    </dl>
    <h3>How the recipe scored it</h3>
    <table>
      <thead>
        <tr>
          <th>Stat</th>
          <th>Amount</th>
          <th>Weight</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        ${mathRows}
      </tbody>
    </table>
  `
}

export function playerDetailHtml(playerId, roster) {
  const player = playersById.get(playerId)

  if (!player) {
    return `
      <section id="player">
        <button type="button" class="back" data-back-team>Back to roster</button>
        <p class="recipe-note">That player is not in the mock pool.</p>
      </section>
    `
  }

  const slot = findSlot(roster, playerId)
  const points = formatPoints(playerPoints(playerId, league.scoring))
  const countsTowardTotal = slot?.status === 'starter'

  return `
    <section id="player">
      <button type="button" class="back" data-back-team>Back to roster</button>
      <p class="hero-badge">${escapeHtml(player.team)} · ${escapeHtml(player.position)}</p>
      <h2>${escapeHtml(player.name)}</h2>
      <p class="lead">
        ${rosterStatusLabel(slot)}. Fantasy points this week:
        <strong>${points}</strong>${countsTowardTotal ? '' : ' (does not count toward the team total)'}.
      </p>
      <div class="actions player-actions">
        ${actionButtons(playerId, roster)}
        <button type="button" class="move" data-start-compare>Compare</button>
      </div>
      ${boxScoreHtml(playerId)}
    </section>
  `
}
