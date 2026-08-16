import './style.css'
import { loadRoster, saveRoster, rosterRows } from './roster.js'

document.querySelector('#app').innerHTML = `
<header>
  <p class="hero-badge">My roster</p>
  <h1>Fantasy Basketball</h1>
  <p class="lead">
    Add a player from this page. The list is saved in this browser, so it
    stays after a refresh.
  </p>
</header>

<section id="roster">
  <form id="add-player">
    <label>
      Player
      <input name="name" type="text" required placeholder="Luka Dončić" />
    </label>
    <label>
      Team
      <input name="team" type="text" required maxlength="3" placeholder="LAL" />
    </label>
    <label>
      Pos
      <select name="position" required>
        <option value="" disabled selected>Select</option>
        <option value="PG">PG</option>
        <option value="SG">SG</option>
        <option value="SF">SF</option>
        <option value="PF">PF</option>
        <option value="C">C</option>
      </select>
    </label>
    <button type="submit">Add player</button>
  </form>

  <table>
    <thead>
      <tr>
        <th>Player</th>
        <th>Team</th>
        <th>Pos</th>
      </tr>
    </thead>
    <tbody id="roster-body"></tbody>
  </table>
</section>
`

const rosterBody = document.querySelector('#roster-body')
const addPlayerForm = document.querySelector('#add-player')
const roster = loadRoster()

function renderRoster() {
  rosterBody.innerHTML = rosterRows(roster)
}

addPlayerForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const form = event.currentTarget
  const name = form.name.value.trim()
  const team = form.team.value.trim().toUpperCase()
  const position = form.position.value

  if (!name || !team || !position) {
    return
  }

  roster.push({ name, team, position })
  saveRoster(roster)
  renderRoster()
  form.reset()
  form.name.focus()
})

renderRoster()
