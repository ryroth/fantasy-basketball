import { league } from './league.js'
import { players, playersById } from './players.js'
import { findSlot } from './roster.js'
import { comparePlayers, formatPoints, playerPoints } from './scoring.js'

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function shortStatus(roster, playerId) {
  const slot = findSlot(roster, playerId)
  if (!slot) {
    return 'Available'
  }

  return slot.status === 'starter' ? 'Starter' : 'Bench'
}

function otherPlayers(leftId) {
  return players
    .filter((player) => player.id !== leftId)
    .sort(
      (left, right) =>
        playerPoints(right.id, league.scoring) -
        playerPoints(left.id, league.scoring),
    )
}

function formatCell(value, isPoints) {
  if (value == null) {
    return '—'
  }

  return isPoints ? formatPoints(value) : String(value)
}

function playerHeader(player, roster) {
  return `
    <div>
      <button type="button" class="player-link" data-open-player="${player.id}">
        ${escapeHtml(player.name)}
      </button>
      <p class="compare-meta">
        ${escapeHtml(player.team)} · ${escapeHtml(player.position)} ·
        ${shortStatus(roster, player.id)}
      </p>
    </div>
  `
}

export function comparePickerHtml(leftId) {
  const left = playersById.get(leftId)

  if (!left) {
    return `
      <section id="compare">
        <button type="button" class="back" data-back-team>Back to roster</button>
        <p class="recipe-note">That player is not in the mock pool.</p>
      </section>
    `
  }

  const rows = otherPlayers(leftId)
    .map(
      (player) => `
        <tr>
          <td class="player-name">${escapeHtml(player.name)}</td>
          <td>${escapeHtml(player.team)}</td>
          <td>${escapeHtml(player.position)}</td>
          <td class="points">${formatPoints(playerPoints(player.id, league.scoring))}</td>
          <td>
            <button type="button" class="add" data-compare-with="${player.id}">
              Compare
            </button>
          </td>
        </tr>
      `,
    )
    .join('')

  return `
    <section id="compare">
      <button type="button" class="back" data-back-player>Back to ${escapeHtml(left.name)}</button>
      <h2>Compare with ${escapeHtml(left.name)}</h2>
      <p class="lead">
        Pick a second player. The next screen uses the same mock week and
        the same scoring recipe.
      </p>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Team</th>
            <th>Pos</th>
            <th>Pts</th>
            <th><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>
  `
}

export function compareHtml(leftId, rightId, roster) {
  const left = playersById.get(leftId)
  const right = playersById.get(rightId)

  if (!left || !right) {
    return `
      <section id="compare">
        <button type="button" class="back" data-back-team>Back to roster</button>
        <p class="recipe-note">One of those players is not in the mock pool.</p>
      </section>
    `
  }

  const comparison = comparePlayers(leftId, rightId, league.scoring)
  const tableRows = comparison.rows
    .map((row) => {
      const isPoints = row.stat === 'FPTS'
      const leftClass = row.winner === 'left' ? 'is-ahead' : ''
      const rightClass = row.winner === 'right' ? 'is-ahead' : ''

      return `
        <tr>
          <th scope="row">${escapeHtml(row.label)}</th>
          <td class="${leftClass}">${formatCell(row.left, isPoints)}</td>
          <td class="${rightClass}">${formatCell(row.right, isPoints)}</td>
        </tr>
      `
    })
    .join('')

  return `
    <section id="compare">
      <button type="button" class="back" data-back-player>Back to ${escapeHtml(left.name)}</button>
      <h2>Compare</h2>
      <p class="lead">
        Same mock week and recipe. The higher counting stat wins each row.
        Turnovers go to the lower number.
      </p>
      <div class="compare-heads">
        ${playerHeader(left, roster)}
        ${playerHeader(right, roster)}
      </div>
      <table class="compare-table">
        <thead>
          <tr>
            <th>Stat</th>
            <th>${escapeHtml(left.name)}</th>
            <th>${escapeHtml(right.name)}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </section>
  `
}
