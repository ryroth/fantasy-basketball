export const league = {
  name: 'My League',
  lifecycle: 'redraft',
  competition: 'points',
  roster: {
    spots: 13,
    starters: 10,
    bench: 3,
  },
  scoring: {
    PTS: 1,
    REB: 1.2,
    AST: 1.5,
    STL: 3,
    BLK: 3,
    TO: -1,
  },
}

const labels = {
  redraft: 'Season-long / redraft',
  points: 'Points',
}

function formatScore(value) {
  return value > 0 ? `+${value}` : String(value)
}

export function recipeHtml(settings) {
  const scoringItems = Object.entries(settings.scoring)
    .map(
      ([stat, value]) =>
        `<li><span>${stat}</span> ${formatScore(value)}</li>`,
    )
    .join('')

  return `
    <section id="recipe">
      <div class="section-heading">
        <h2>League recipe</h2>
        <p>Read-only</p>
      </div>
      <p class="recipe-note">
        These rules live in one settings file. The roster limit already reads
        from here. Scoring will use this formula in a later slice.
      </p>
      <dl class="recipe-grid">
        <div>
          <dt>League</dt>
          <dd>${settings.name}</dd>
        </div>
        <div>
          <dt>Lifecycle</dt>
          <dd>${labels[settings.lifecycle]}</dd>
        </div>
        <div>
          <dt>Scoring</dt>
          <dd>${labels[settings.competition]}</dd>
        </div>
        <div>
          <dt>Roster</dt>
          <dd>${settings.roster.spots} spots · ${settings.roster.starters} start · ${settings.roster.bench} bench</dd>
        </div>
      </dl>
      <ul class="scoring-chips">
        ${scoringItems}
      </ul>
    </section>
  `
}
