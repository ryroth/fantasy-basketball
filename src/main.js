import './style.css'
import { league, recipeHtml } from './league.js'
import { matchupHtml } from './matchup.js'
import { compareHtml, comparePickerHtml } from './compare.js'
import { playerDetailHtml } from './player.js'
import {
  ROSTER_LIMIT,
  STARTER_LIMIT,
  BENCH_LIMIT,
  loadRoster,
  saveRoster,
  isDefaultRoster,
  resetRoster,
  lineupCounts,
  addPlayer,
  removePlayer,
  setLineupStatus,
  rosterRows,
  poolRows,
  availablePlayers,
} from './roster.js'
import { formatPoints, starterPoints } from './scoring.js'

document.querySelector('#app').innerHTML = `
<header>
  <p class="hero-badge">My roster</p>
  <h1>Fantasy Basketball</h1>
  <p class="lead">
    Each player has a mock box score for this week. Click a name to see how
    the recipe scored it, compare two players, or check the matchup. Only
    starters count toward the team total.
  </p>
</header>

<div id="team-view">
  ${recipeHtml(league)}

  <div id="matchup-view"></div>

  <section id="roster">
    <div class="section-heading">
      <h2>My roster</h2>
      <p id="roster-count"></p>
    </div>
    <div class="roster-toolbar">
      <p id="week-score"></p>
      <button type="button" class="remove" id="reset-roster" data-reset-roster>
        Reset roster
      </button>
    </div>
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
      <p id="pool-count"></p>
    </div>
    <form id="pool-filters" class="pool-filters">
      <label>
        Search
        <input id="pool-search" type="search" placeholder="Name or team" />
      </label>
      <div class="position-filters" role="group" aria-label="Position">
        <button type="button" class="position-filter" data-position="" aria-pressed="true">All</button>
        <button type="button" class="position-filter" data-position="PG" aria-pressed="false">PG</button>
        <button type="button" class="position-filter" data-position="SG" aria-pressed="false">SG</button>
        <button type="button" class="position-filter" data-position="SF" aria-pressed="false">SF</button>
        <button type="button" class="position-filter" data-position="PF" aria-pressed="false">PF</button>
        <button type="button" class="position-filter" data-position="C" aria-pressed="false">C</button>
      </div>
    </form>
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
</div>

<div id="player-view" hidden></div>
`

const teamView = document.querySelector('#team-view')
const playerView = document.querySelector('#player-view')
const rosterBody = document.querySelector('#roster-body')
const poolBody = document.querySelector('#pool-body')
const rosterCount = document.querySelector('#roster-count')
const weekScore = document.querySelector('#week-score')
const resetButton = document.querySelector('#reset-roster')
const matchupView = document.querySelector('#matchup-view')
const poolCount = document.querySelector('#pool-count')
const poolSearch = document.querySelector('#pool-search')
const roster = loadRoster()
let selectedPlayerId = null
let compareWithId = null
let poolQuery = ''
let poolPosition = ''

function poolFilters() {
  return { query: poolQuery, position: poolPosition }
}

function render() {
  if (selectedPlayerId && compareWithId === 'pick') {
    teamView.hidden = true
    playerView.hidden = false
    playerView.innerHTML = comparePickerHtml(selectedPlayerId)
    return
  }

  if (selectedPlayerId && compareWithId) {
    teamView.hidden = true
    playerView.hidden = false
    playerView.innerHTML = compareHtml(selectedPlayerId, compareWithId, roster)
    return
  }

  if (selectedPlayerId) {
    teamView.hidden = true
    playerView.hidden = false
    playerView.innerHTML = playerDetailHtml(selectedPlayerId, roster)
    return
  }

  const counts = lineupCounts(roster)
  teamView.hidden = false
  playerView.hidden = true
  rosterCount.textContent = `${counts.total} / ${ROSTER_LIMIT} · ${counts.starters} / ${STARTER_LIMIT} start · ${counts.bench} / ${BENCH_LIMIT} bench`
  weekScore.textContent = `Starters this week: ${formatPoints(starterPoints(roster, league.scoring))} pts`
  resetButton.disabled = isDefaultRoster(roster)
  matchupView.innerHTML = matchupHtml(roster)
  rosterBody.innerHTML = rosterRows(roster)
  poolBody.innerHTML = poolRows(roster, poolFilters())
  poolCount.textContent = `${availablePlayers(roster, poolFilters()).length} shown`
  if (document.activeElement !== poolSearch) {
    poolSearch.value = poolQuery
  }
  document.querySelectorAll('.position-filter').forEach((button) => {
    button.setAttribute(
      'aria-pressed',
      button.dataset.position === poolPosition ? 'true' : 'false',
    )
  })
}

function persist() {
  saveRoster(roster)
  render()
}

document.querySelector('#pool-filters').addEventListener('submit', (event) => {
  event.preventDefault()
})

poolSearch.addEventListener('input', (event) => {
  poolQuery = event.target.value
  render()
})

document.querySelector('#app').addEventListener('click', (event) => {
  const positionButton = event.target.closest('[data-position]')
  if (positionButton) {
    poolPosition = positionButton.dataset.position
    render()
    return
  }
  const openButton = event.target.closest('[data-open-player]')
  if (openButton) {
    selectedPlayerId = openButton.dataset.openPlayer
    compareWithId = null
    render()
    return
  }

  if (event.target.closest('[data-start-compare]')) {
    compareWithId = 'pick'
    render()
    return
  }

  const compareButton = event.target.closest('[data-compare-with]')
  if (compareButton) {
    compareWithId = compareButton.dataset.compareWith
    render()
    return
  }

  if (event.target.closest('[data-back-player]')) {
    compareWithId = null
    render()
    return
  }

  if (event.target.closest('[data-reset-roster]')) {
    if (isDefaultRoster(roster)) {
      return
    }

    const confirmed = window.confirm(
      'Reset the roster to the five starter players? Added players and lineup changes will be cleared.',
    )
    if (!confirmed) {
      return
    }

    resetRoster(roster)
    persist()
    return
  }

  if (event.target.closest('[data-back-team]')) {
    selectedPlayerId = null
    compareWithId = null
    render()
    return
  }

  const removeButton = event.target.closest('[data-remove]')
  if (removeButton) {
    if (removePlayer(roster, removeButton.dataset.remove)) {
      persist()
    }
    return
  }

  const moveButton = event.target.closest('[data-lineup]')
  if (moveButton && !moveButton.disabled) {
    if (setLineupStatus(roster, moveButton.dataset.player, moveButton.dataset.lineup)) {
      persist()
    }
    return
  }

  const addButton = event.target.closest('[data-add]')
  if (addButton && !addButton.disabled) {
    if (addPlayer(roster, addButton.dataset.add)) {
      persist()
    }
  }
})

render()
