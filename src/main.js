import './style.css'
import { league, recipeHtml } from './league.js'
import {
  ROSTER_LIMIT,
  STARTER_LIMIT,
  BENCH_LIMIT,
  loadRoster,
  saveRoster,
  lineupCounts,
  addPlayer,
  removePlayer,
  setLineupStatus,
  rosterRows,
  poolRows,
} from './roster.js'
import { formatPoints, starterPoints } from './scoring.js'

document.querySelector('#app').innerHTML = `
<header>
  <p class="hero-badge">My roster</p>
  <h1>Fantasy Basketball</h1>
  <p class="lead">
    Each player has a mock box score for this week. Add from the pool, set
    starters, and watch the team total — only starters count.
  </p>
</header>

${recipeHtml(league)}

<section id="roster">
  <div class="section-heading">
    <h2>My roster</h2>
    <p id="roster-count"></p>
  </div>
  <p id="week-score"></p>
  <table>
    <thead>
      <tr>
        <th>Player</th>
        <th>Team</th>
        <th>Pos</th>
        <th>Lineup</th>
        <th>Pts</th>
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
        <th>Pts</th>
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
const weekScore = document.querySelector('#week-score')
const roster = loadRoster()

function render() {
  const counts = lineupCounts(roster)
  rosterCount.textContent = `${counts.total} / ${ROSTER_LIMIT} · ${counts.starters} / ${STARTER_LIMIT} start · ${counts.bench} / ${BENCH_LIMIT} bench`
  weekScore.textContent = `Starters this week: ${formatPoints(starterPoints(roster, league.scoring))} pts`
  rosterBody.innerHTML = rosterRows(roster)
  poolBody.innerHTML = poolRows(roster)
}

function persist() {
  saveRoster(roster)
  render()
}

rosterBody.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove]')
  if (removeButton) {
    if (removePlayer(roster, removeButton.dataset.remove)) {
      persist()
    }
    return
  }

  const moveButton = event.target.closest('[data-lineup]')
  if (!moveButton || moveButton.disabled) {
    return
  }

  if (setLineupStatus(roster, moveButton.dataset.player, moveButton.dataset.lineup)) {
    persist()
  }
})

poolBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]')
  if (!button || button.disabled) {
    return
  }

  if (addPlayer(roster, button.dataset.add)) {
    persist()
  }
})

render()
