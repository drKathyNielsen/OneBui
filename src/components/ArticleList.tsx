import type { Article } from '../types';

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
            <div
              className="oneb-thumb"
              role={item.image ? undefined : 'img'}
              aria-label={item.image ? undefined : 'No image available'}
            >
              {item.image && <img src={item.image} alt={item.alt ?? ''} />}
            </div>
            <div className="oneb-article-body">
              <h3 className="oneb-article-title">{item.title}</h3>
              <p className="oneb-article-desc">{item.description}</p>
              <p className="oneb-meta">
                <a href={item.url} className="oneb-source-link">{item.source}</a> · {item.topic}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
