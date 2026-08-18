import './style.css'
import {
  ROSTER_LIMIT,
  loadRoster,
  saveRoster,
  rosterPlayers,
  availablePlayers,
  playerRows,
} from './roster.js'

document.querySelector('#app').innerHTML = `
<header>
  <p class="hero-badge">My roster</p>
  <h1>Fantasy Basketball</h1>
  <p class="lead">
    Add players from the pool. Your team can hold ${ROSTER_LIMIT}. Removing
    a player puts them back in the pool.
  </p>
</header>

<section id="roster">
  <div class="section-heading">
    <h2>My roster</h2>
    <p id="roster-count"></p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Player</th>
        <th>Team</th>
        <th>Pos</th>
        <th><span class="visually-hidden">Actions</span></th>
      </tr>
    </thead>
    <tbody id="roster-body"></tbody>
  </table>
</section>

<section id="pool">
  <div class="section-heading">
    <h2>Available players</h2>
  </div>
  <table>
    <thead>
      <tr>
        <th>Player</th>
        <th>Team</th>
        <th>Pos</th>
        <th><span class="visually-hidden">Actions</span></th>
      </tr>
    </thead>
    <tbody id="pool-body"></tbody>
  </table>
</section>
`

const rosterBody = document.querySelector('#roster-body')
const poolBody = document.querySelector('#pool-body')
const rosterCount = document.querySelector('#roster-count')
const roster = loadRoster()

function render() {
  const full = roster.length >= ROSTER_LIMIT
  rosterCount.textContent = `${roster.length} / ${ROSTER_LIMIT}`
  rosterBody.innerHTML = playerRows(rosterPlayers(roster), 'remove')
  poolBody.innerHTML = playerRows(availablePlayers(roster), 'add', full)
}

rosterBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]')
  if (!button) {
    return
  }

  const index = roster.indexOf(button.dataset.remove)
  if (index === -1) {
    return
  }

  roster.splice(index, 1)
  saveRoster(roster)
  render()
})

poolBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]')
  if (!button || button.disabled || roster.length >= ROSTER_LIMIT) {
    return
  }

  const playerId = button.dataset.add
  if (roster.includes(playerId)) {
    return
  }

  roster.push(playerId)
  saveRoster(roster)
  render()
})

render()
