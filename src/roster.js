export const roster = [
  { name: 'Shai Gilgeous-Alexander', team: 'OKC', position: 'PG' },
  { name: 'Anthony Edwards', team: 'MIN', position: 'SG' },
  { name: 'Ryan Roth', team: 'BOS', position: 'SF' },
  { name: 'Giannis Antetokounmpo', team: 'MIL', position: 'PF' },
  { name: 'Nikola Jokić', team: 'DEN', position: 'C' },
]

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
