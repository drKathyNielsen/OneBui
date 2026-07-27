import type { Article } from '../types';
import Thumb from './Thumb';

interface Props {
  heading: string;
  items: Article[];
}

export default function ArticleList({ heading, items }: Props) {
  const headingId = `heading-${heading.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <section className="oneb-section" aria-labelledby={headingId}>
      <h2 className="oneb-section-heading" id={headingId}>{heading}</h2>
      <ol className="oneb-article-list list-unstyled">
        {items.map((item) => (
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
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
