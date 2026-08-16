import './style.css'
import { roster, rosterRows } from './roster.js'

document.querySelector('#app').innerHTML = `
<header>
  <p class="hero-badge">My roster</p>
  <h1>Fantasy Basketball</h1>
  <p class="lead">
    A starter roster of sample players. Nothing is live yet — this list is
    written in the code.
  </p>
</header>

<section id="roster">
  <table>
    <thead>
      <tr>
        <th>Player</th>
        <th>Team</th>
        <th>Pos</th>
      </tr>
    </thead>
    <tbody>
      ${rosterRows(roster)}
    </tbody>
  </table>
</section>
`
