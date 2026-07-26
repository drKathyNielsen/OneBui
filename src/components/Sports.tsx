export default function Sports({ sports, heading }: { sports: { team: string; scores: string[] }[]; heading: string }) {
  return (
    <section className="oneb-section" aria-labelledby="heading-sports">
      <h2 className="oneb-section-heading" id="heading-sports">{heading}</h2>
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
