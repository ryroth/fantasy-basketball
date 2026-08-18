import { league } from './league.js'
import { players, playersById } from './players.js'

export const ROSTER_LIMIT = league.roster.spots

export const starterRosterIds = ['sga', 'edwards', 'tatum', 'giannis', 'jokic']

const STORAGE_KEY = 'fantasy-basketball-roster'

function isPlayerId(value) {
  return typeof value === 'string' && playersById.has(value)
}

function idsFromSavedRoster(parsed) {
  const ids = []

  for (const item of parsed) {
    if (isPlayerId(item) && !ids.includes(item)) {
      ids.push(item)
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

export function loadRoster() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return [...starterRosterIds]
  }

  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) {
      return [...starterRosterIds]
    }

    const ids = idsFromSavedRoster(parsed)
    return ids.length > 0 ? ids : [...starterRosterIds]
  } catch {
    return [...starterRosterIds]
  }
}

export function saveRoster(rosterIds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rosterIds))
}

export function rosterPlayers(rosterIds) {
  return rosterIds.map((id) => playersById.get(id)).filter(Boolean)
}

export function availablePlayers(rosterIds) {
  const taken = new Set(rosterIds)
  return players.filter((player) => !taken.has(player.id))
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function playerRows(playerList, action, rosterFull = false) {
  const isAdd = action === 'add'
  const label = isAdd ? 'Add' : 'Remove'
  const attr = isAdd ? 'data-add' : 'data-remove'
  const className = isAdd ? 'add' : 'remove'

  return playerList
    .map((player) => {
      const disabled = isAdd && rosterFull ? ' disabled' : ''
      return `
        <tr>
          <td class="player-name">${escapeHtml(player.name)}</td>
          <td>${escapeHtml(player.team)}</td>
          <td>${escapeHtml(player.position)}</td>
          <td>
            <button type="button" class="${className}" ${attr}="${player.id}"${disabled}>
              ${label}
            </button>
          </td>
        </tr>
      `
    })
    .join('')
}
