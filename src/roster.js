import { league } from './league.js'
import { players, playersById } from './players.js'
import { formatPoints, playerPoints } from './scoring.js'

export const ROSTER_LIMIT = league.roster.spots
export const STARTER_LIMIT = league.roster.starters
export const BENCH_LIMIT = league.roster.bench

export const starterRosterIds = ['sga', 'edwards', 'tatum', 'giannis', 'jokic']

const STORAGE_KEY = 'fantasy-basketball-roster'

function isPlayerId(value) {
  return typeof value === 'string' && playersById.has(value)
}

function isLineupStatus(value) {
  return value === 'starter' || value === 'bench'
}

function countStatus(roster, status) {
  return roster.filter((slot) => slot.status === status).length
}

function idsFromSavedRoster(parsed) {
  const ids = []

  for (const item of parsed) {
    if (isPlayerId(item) && !ids.includes(item)) {
      ids.push(item)
      continue
    }

    if (item && isPlayerId(item.id) && !ids.includes(item.id)) {
      ids.push(item.id)
      continue
    }

    if (item && typeof item.name === 'string') {
      const match = players.find((player) => player.name === item.name)
      if (match && !ids.includes(match.id)) {
        ids.push(match.id)
      }
    }
  }

  return ids
}

function savedStatusById(parsed) {
  const statuses = new Map()

  for (const item of parsed) {
    if (item && isPlayerId(item.id) && isLineupStatus(item.status)) {
      statuses.set(item.id, item.status)
    }
  }

  return statuses
}

function assignLineup(ids, statuses) {
  const roster = []
  let starters = 0
  let bench = 0

  for (const id of ids) {
    const preferred = statuses.get(id)
    let status

    if (preferred === 'starter' && starters < STARTER_LIMIT) {
      status = 'starter'
    } else if (preferred === 'bench' && bench < BENCH_LIMIT) {
      status = 'bench'
    } else if (starters < STARTER_LIMIT) {
      status = 'starter'
    } else if (bench < BENCH_LIMIT) {
      status = 'bench'
    } else {
      continue
    }

    if (status === 'starter') {
      starters += 1
    } else {
      bench += 1
    }

    roster.push({ id, status })
  }

  return roster
}

export function createStarterRoster() {
  return assignLineup(starterRosterIds, new Map())
}

export function loadRoster() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return createStarterRoster()
  }

  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) {
      return createStarterRoster()
    }

    const roster = assignLineup(idsFromSavedRoster(parsed), savedStatusById(parsed))
    return roster.length > 0 ? roster : createStarterRoster()
  } catch {
    return createStarterRoster()
  }
}

export function saveRoster(roster) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roster))
}

export function isDefaultRoster(roster) {
  const fresh = createStarterRoster()
  return (
    roster.length === fresh.length &&
    roster.every(
      (slot, index) =>
        slot.id === fresh[index].id && slot.status === fresh[index].status,
    )
  )
}

export function resetRoster(roster) {
  roster.splice(0, roster.length, ...createStarterRoster())
}

export function rosterIds(roster) {
  return roster.map((slot) => slot.id)
}

export function lineupCounts(roster) {
  return {
    total: roster.length,
    starters: countStatus(roster, 'starter'),
    bench: countStatus(roster, 'bench'),
  }
}

export function addPlayer(roster, playerId) {
  if (!isPlayerId(playerId) || roster.some((slot) => slot.id === playerId)) {
    return false
  }

  const counts = lineupCounts(roster)
  let status

  if (counts.starters < STARTER_LIMIT) {
    status = 'starter'
  } else if (counts.bench < BENCH_LIMIT) {
    status = 'bench'
  } else {
    return false
  }

  roster.push({ id: playerId, status })
  return true
}

export function removePlayer(roster, playerId) {
  const index = roster.findIndex((slot) => slot.id === playerId)
  if (index === -1) {
    return false
  }

  roster.splice(index, 1)
  return true
}

export function findSlot(roster, playerId) {
  return roster.find((slot) => slot.id === playerId) ?? null
}

export function setLineupStatus(roster, playerId, status) {
  if (!isLineupStatus(status)) {
    return false
  }

  const slot = roster.find((entry) => entry.id === playerId)
  if (!slot || slot.status === status) {
    return false
  }

  const counts = lineupCounts(roster)
  if (status === 'starter' && counts.starters >= STARTER_LIMIT) {
    return false
  }
  if (status === 'bench' && counts.bench >= BENCH_LIMIT) {
    return false
  }

  slot.status = status
  return true
}

export function rosterPlayers(roster) {
  const order = { starter: 0, bench: 1 }

  return [...roster]
    .sort((left, right) => order[left.status] - order[right.status])
    .map((slot) => {
      const player = playersById.get(slot.id)
      return player ? { ...player, status: slot.status } : null
    })
    .filter(Boolean)
}

export function availablePlayers(roster) {
  const taken = new Set(rosterIds(roster))
  return players
    .filter((player) => !taken.has(player.id))
    .sort(
      (left, right) =>
        playerPoints(right.id, league.scoring) -
        playerPoints(left.id, league.scoring),
    )
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function lineupLabel(status) {
  return status === 'starter' ? 'Starter' : 'Bench'
}

function playerNameCell(player) {
  return `
    <td class="player-name">
      <button type="button" class="player-link" data-open-player="${player.id}">
        ${escapeHtml(player.name)}
      </button>
    </td>
  `
}

export function rosterRows(roster) {
  const counts = lineupCounts(roster)
  const startFull = counts.starters >= STARTER_LIMIT
  const benchFull = counts.bench >= BENCH_LIMIT

  return rosterPlayers(roster)
    .map((player) => {
      const isStarter = player.status === 'starter'
      const moveStatus = isStarter ? 'bench' : 'starter'
      const moveLabel = isStarter ? 'Bench' : 'Start'
      const moveBlocked = isStarter ? benchFull : startFull

      return `
        <tr>
          ${playerNameCell(player)}
          <td>${escapeHtml(player.team)}</td>
          <td>${escapeHtml(player.position)}</td>
          <td>${lineupLabel(player.status)}</td>
          <td class="${isStarter ? 'points' : 'points points-bench'}" title="${isStarter ? 'Counts toward this week' : 'Bench does not count this week'}">
            ${formatPoints(playerPoints(player.id, league.scoring))}
          </td>
          <td class="actions">
            <button
              type="button"
              class="move"
              data-lineup="${moveStatus}"
              data-player="${player.id}"
              ${moveBlocked ? 'disabled' : ''}
            >
              ${moveLabel}
            </button>
            <button type="button" class="remove" data-remove="${player.id}">
              Remove
            </button>
          </td>
        </tr>
      `
    })
    .join('')
}

export function poolRows(roster) {
  const full = roster.length >= ROSTER_LIMIT

  return availablePlayers(roster)
    .map((player) => {
      const disabled = full ? ' disabled' : ''
      return `
        <tr>
          ${playerNameCell(player)}
          <td>${escapeHtml(player.team)}</td>
          <td>${escapeHtml(player.position)}</td>
          <td class="points">${formatPoints(playerPoints(player.id, league.scoring))}</td>
          <td>
            <button type="button" class="add" data-add="${player.id}"${disabled}>
              Add
            </button>
          </td>
        </tr>
      `
    })
    .join('')
}
