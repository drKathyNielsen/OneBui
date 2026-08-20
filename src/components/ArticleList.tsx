import type { Article } from '../types';
import type { PagerStrings } from '../data/strings';
import { usePaging } from '../hooks/usePaging';
import Thumb from './Thumb';
import ArticleFeedback from './ArticleFeedback';
import ArticleQuestions from './ArticleQuestions';
import Pager from './Pager';

// The digest carries a complete ordered candidate set (weeklies run to 15), so
// the display bound is ours. Three keeps today's density; the rest stays one
// click away in either direction rather than behind a one-way reveal.
const PAGE_SIZE = 3;

interface Props {
  heading: string;
  items: Article[];
  emptyNote: string; // shown when items is empty, so the header never stands alone
  blurb: string; // one line under the heading saying what the section is for
  pager: PagerStrings; // per-style control text
  questionsLabel: string; // per-style label for an item's conversational openers
}

export default function ArticleList({ heading, items, emptyNote, blurb, pager, questionsLabel }: Props) {
  const headingId = `heading-${heading.toLowerCase().replace(/\s+/g, '-')}`;
  const { visible, page, pageCount, next, prev } = usePaging(items, PAGE_SIZE);

  return (
    <section className="oneb-section" aria-labelledby={headingId}>
      <h2 className="oneb-section-heading" id={headingId}><span className="oneb-section-heading-badge">{heading}</span></h2>
      <p className="oneb-section-blurb">{blurb}</p>
      {items.length === 0 ? (
        <p className="oneb-empty">{emptyNote}</p>
      ) : (
      <>
      <ol className="oneb-article-list list-unstyled">
        {visible.map((item) => (
          <li key={item.url} className="oneb-article">
            <Thumb article={item} />
            <div className="oneb-article-body">
              <h3 className="oneb-article-title">{item.title}</h3>
              <p className="oneb-article-desc">{item.description}</p>
              {item.summary && <p className="oneb-article-summary">{item.summary}</p>}
              <ArticleQuestions questions={item.questions} label={questionsLabel} />
              <p className="oneb-meta">
                {item.dateLabel && <>{item.dateLabel} · </>}
                <a href={item.url} className="oneb-source-link" target="_blank" rel="noopener noreferrer">{item.source}</a> · {item.topic}
              </p>
              <ArticleFeedback uid={item.uid} title={item.title} />
            </div>
          </li>
        ))}
      </ol>
      <Pager
        label={heading.toLowerCase()}
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        total={items.length}
        prevText={pager.prev}
        nextText={pager.next}
        onPrev={prev}
        onNext={next}
      />
      </>
      )}
    </section>
  );
}
