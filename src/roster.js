export const starterRoster = [
  { name: 'Shai Gilgeous-Alexander', team: 'OKC', position: 'PG' },
  { name: 'Anthony Edwards', team: 'MIN', position: 'SG' },
  { name: 'Ryan Roth', team: 'BOS', position: 'SF' },
  { name: 'Giannis Antetokounmpo', team: 'MIL', position: 'PF' },
  { name: 'Nikola Jokić', team: 'DEN', position: 'C' },
]

const STORAGE_KEY = 'fantasy-basketball-roster'

function copyRoster(players) {
  return players.map((player) => ({ ...player }))
}

function isPlayer(value) {
  return (
    value &&
    typeof value.name === 'string' &&
    typeof value.team === 'string' &&
    typeof value.position === 'string'
  )
}

export function loadRoster() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return copyRoster(starterRoster)
  }

  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) {
      return copyRoster(starterRoster)
    }

    return parsed.filter(isPlayer)
  } catch {
    return copyRoster(starterRoster)
  }
}

export function saveRoster(players) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function rosterRows(players) {
  return players
    .map(
      (player) => `
        <tr>
          <td class="player-name">${escapeHtml(player.name)}</td>
          <td>${escapeHtml(player.team)}</td>
          <td>${escapeHtml(player.position)}</td>
        </tr>
      `,
    )
    .join('')
}
