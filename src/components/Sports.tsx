import type { PagerStrings } from '../data/strings';
import { usePaging } from '../hooks/usePaging';
import Pager from './Pager';

// Paged by team, not by line: a team's lines belong together, and a weekly can
// carry six teams' worth.
const PAGE_SIZE = 3;

interface Props {
  sports: { team: string; scores: string[] }[];
  heading: string;
  emptyNote: string;
  pager: PagerStrings;
}

export default function Sports({ sports, heading, emptyNote, pager }: Props) {
  const { visible, page, pageCount, next, prev } = usePaging(sports, PAGE_SIZE);

  return (
    <section className="oneb-section" aria-labelledby="heading-sports">
      <h2 className="oneb-section-heading" id="heading-sports"><span className="oneb-section-heading-badge">{heading}</span></h2>
      {sports.length === 0 && <p className="oneb-empty">{emptyNote}</p>}
      {visible.map((team) => (
        <div className="oneb-sports-team" key={team.team}>
          <h3 className="oneb-sports-team-name">{team.team}</h3>
          {team.scores.map((s, i) => (
            <p className="oneb-sports-score" key={i}>{s}</p>
          ))}
        </div>
      ))}
      <Pager
        label={heading.toLowerCase()}
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        total={sports.length}
        prevText={pager.prev}
        nextText={pager.next}
        onPrev={prev}
        onNext={next}
      />
    </section>
  );
}
