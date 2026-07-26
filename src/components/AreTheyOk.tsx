import type { Article } from '../types';

export default function AreTheyOk({ article }: { article: Article }) {
  return (
    <div className="oneb-card">
      <h2 className="oneb-section-heading oneb-section-heading--plain">Are they ok?</h2>
      <div className="oneb-card-top">
        <div
          className="oneb-thumb oneb-thumb--lead"
          role={article.image ? undefined : 'img'}
          aria-label={article.image ? undefined : 'No image available'}
        >
          {article.image && <img src={article.image} alt={article.alt ?? ''} />}
        </div>
        <h3 className="oneb-headline">{article.title}</h3>
      </div>
      <p className="oneb-lead">{article.description}</p>
      <p className="oneb-meta">
        <a href={article.url} className="oneb-source-link">{article.source}</a> · {article.topic}
      </p>
    </div>
  );
}
