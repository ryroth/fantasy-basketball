export const roster = [
  { name: 'Shai Gilgeous-Alexander', team: 'OKC', position: 'PG' },
  { name: 'Anthony Edwards', team: 'MIN', position: 'SG' },
  { name: 'Ryan Roth', team: 'BOS', position: 'SF' },
  { name: 'Giannis Antetokounmpo', team: 'MIL', position: 'PF' },
  { name: 'Nikola Jokić', team: 'DEN', position: 'C' },
]

export function rosterRows(players) {
  return players
    .map(
      (player) => `
        <tr>
          <td class="player-name">${player.name}</td>
          <td>${player.team}</td>
          <td>${player.position}</td>
        </tr>
      `,
    )
    .join('')
}
