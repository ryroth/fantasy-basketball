import { league } from './league.js'
import { players, playersById } from './players.js'
import { STARTER_LIMIT, rosterIds } from './roster.js'
import { formatPoints, playerPoints, starterPoints } from './scoring.js'

export const opponentName = 'Week 1 opponent'

const preferredOpponentIds = [
  'doncic',
  'booker',
  'durant',
  'wembanyama',
  'curry',
  'lebron',
  'mitchell',
  'paolo',
  'embiid',
  'kawhi',
]

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function buildOpponentRoster(userRoster) {
  const taken = new Set(rosterIds(userRoster))
  const ids = []

  for (const id of preferredOpponentIds) {
    if (!taken.has(id) && playersById.has(id)) {
      ids.push(id)
    }
    if (ids.length >= STARTER_LIMIT) {
      break
    }
  }

  if (ids.length < STARTER_LIMIT) {
    const extras = players
      .filter((player) => !taken.has(player.id) && !ids.includes(player.id))
      .sort(
        (left, right) =>
          playerPoints(right.id, league.scoring) -
          playerPoints(left.id, league.scoring),
      )

    for (const player of extras) {
      ids.push(player.id)
      if (ids.length >= STARTER_LIMIT) {
        break
      }
    }
  }

  return ids.map((id) => ({ id, status: 'starter' }))
}

export function matchupSummary(userRoster) {
  const opponent = buildOpponentRoster(userRoster)
  const mine = starterPoints(userRoster, league.scoring)
  const theirs = starterPoints(opponent, league.scoring)
  const diff = mine - theirs
  let result = 'tie'

  if (diff > 0) {
    result = 'lead'
  } else if (diff < 0) {
    result = 'trail'
  }

  return { opponent, mine, theirs, diff, result }
}

function resultLine(summary) {
  if (summary.result === 'tie') {
    return 'The mock week is tied.'
  }

  const margin = formatPoints(Math.abs(summary.diff))
  if (summary.result === 'lead') {
    return `You lead by ${margin} pts.`
  }

  return `You trail by ${margin} pts.`
}

function opponentRows(opponent) {
  return opponent
    .map((slot) => {
      const player = playersById.get(slot.id)
      if (!player) {
        return ''
      }

      return `
        <tr>
          <td class="player-name">
            <button type="button" class="player-link" data-open-player="${player.id}">
              ${escapeHtml(player.name)}
            </button>
          </td>
          <td>${escapeHtml(player.team)}</td>
          <td>${escapeHtml(player.position)}</td>
          <td class="points">${formatPoints(playerPoints(player.id, league.scoring))}</td>
        </tr>
      `
    })
    .join('')
}

export function matchupHtml(userRoster) {
  const summary = matchupSummary(userRoster)

  return `
    <section id="matchup">
      <div class="section-heading">
        <h2>This week</h2>
        <p>${escapeHtml(league.name)} vs ${escapeHtml(opponentName)}</p>
      </div>
      <div class="scoreboard">
        <div>
          <p class="score-label">You</p>
          <p class="score-value">${formatPoints(summary.mine)}</p>
        </div>
        <div>
          <p class="score-label">Opponent</p>
          <p class="score-value">${formatPoints(summary.theirs)}</p>
        </div>
      </div>
      <p class="matchup-result">${resultLine(summary)}</p>
      <p class="recipe-note">
        Only starters count. The opponent is filled from players you do not
        roster, so adding one of their names moves that player to your team.
      </p>
      <h3>Opponent starters</h3>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Team</th>
            <th>Pos</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${opponentRows(summary.opponent)}
        </tbody>
      </table>
    </section>
  `
}
