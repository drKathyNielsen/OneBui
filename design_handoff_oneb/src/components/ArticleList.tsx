import type { Article } from '../types';

interface Props {
  heading: string;
  items: Article[];
  variant: 'numbered' | 'bulleted';
}

export default function ArticleList({ heading, items, variant }: Props) {
  return (
    <section className="oneb-section" aria-labelledby={`heading-${heading}`}>
      <h2 className="oneb-section-heading" id={`heading-${heading}`}>{heading}</h2>
      <ol className="oneb-article-list list-unstyled">
        {items.map((item, i) => (
          <li key={item.url} className="oneb-article">
            <span className="oneb-article-marker" aria-hidden="true">
              {variant === 'numbered' ? item.n ?? i + 1 : '▪'}
            </span>
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
