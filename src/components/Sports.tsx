export default function Sports({ sports, heading, emptyNote }: { sports: { team: string; scores: string[] }[]; heading: string; emptyNote: string }) {
  return (
    <section className="oneb-section" aria-labelledby="heading-sports">
      <h2 className="oneb-section-heading" id="heading-sports"><span className="oneb-section-heading-badge">{heading}</span></h2>
      {sports.length === 0 && <p className="oneb-empty">{emptyNote}</p>}
      {sports.map((team) => (
        <div className="oneb-sports-team" key={team.team}>
          <h3 className="oneb-sports-team-name">{team.team}</h3>
          {team.scores.map((s, i) => (
            <p className="oneb-sports-score" key={i}>{s}</p>
          ))}
        </div>
      ))}
    </section>
  );
}
