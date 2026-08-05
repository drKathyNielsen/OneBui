import { useState } from 'react';
import type { Article } from '../types';
import Thumb from './Thumb';
import ArticleFeedback from './ArticleFeedback';

// Items beyond this are hidden behind the "more" link, so a day with a full
// 6-item section doesn't dump all of it on the reader at once.
const PAGE_SIZE = 3;

interface Props {
  heading: string;
  items: Article[];
  emptyNote: string; // shown when items is empty, so the header never stands alone
  moreLabel: string; // per-style label for the reveal-next-3 link
}

export default function ArticleList({ heading, items, emptyNote, moreLabel }: Props) {
  const headingId = `heading-${heading.toLowerCase().replace(/\s+/g, '-')}`;
  const [shown, setShown] = useState(PAGE_SIZE);
  // Reset the reveal count when the underlying list changes (day/period switch),
  // so an expanded Monday doesn't carry over into a freshly mounted Tuesday.
  // Adjusted during render (React's prop-driven-state-reset pattern) rather
  // than in an effect, to avoid an extra render pass.
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setShown(PAGE_SIZE);
  }
  const visible = items.slice(0, shown);
  const hasMore = shown < items.length;

  return (
    <section className="oneb-section" aria-labelledby={headingId}>
      <h2 className="oneb-section-heading" id={headingId}><span className="oneb-section-heading-badge">{heading}</span></h2>
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
              <p className="oneb-meta">
                {item.dateLabel && <>{item.dateLabel} · </>}
                <a href={item.url} className="oneb-source-link" target="_blank" rel="noopener noreferrer">{item.source}</a> · {item.topic}
              </p>
              <ArticleFeedback uid={item.uid} title={item.title} />
            </div>
          </li>
        ))}
      </ol>
      {hasMore && (
        <button type="button" className="oneb-link-btn oneb-more-btn" onClick={() => setShown((s) => s + PAGE_SIZE)}>
          {moreLabel}
        </button>
      )}
      </>
      )}
    </section>
  );
}
