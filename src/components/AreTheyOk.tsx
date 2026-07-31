import type { Article } from '../types';
import Thumb from './Thumb';

export default function AreTheyOk({ article, eyebrow, emptyNote }: { article?: Article; eyebrow: string; emptyNote?: string }) {
  if (!article) {
    return (
      <div className="oneb-card">
        <h2 className="oneb-section-heading oneb-section-heading--plain"><span className="oneb-section-heading-badge">{eyebrow}</span></h2>
        <p className="oneb-empty">{emptyNote}</p>
      </div>
    );
  }
  return (
    <div className="oneb-card">
      <h2 className="oneb-section-heading oneb-section-heading--plain"><span className="oneb-section-heading-badge">{eyebrow}</span></h2>
      <div className="oneb-card-top">
        <Thumb article={article} lead />
        <div className="oneb-card-top-text">
          <h3 className="oneb-headline">{article.title}</h3>
          <p className="oneb-lead">{article.description}</p>
        </div>
      </div>
      {article.summary && <p className="oneb-lead oneb-lead--summary">{article.summary}</p>}
      <p className="oneb-meta">
        {article.dateLabel && <>{article.dateLabel} · </>}
        <a href={article.url} className="oneb-source-link" target="_blank" rel="noopener noreferrer">{article.source}</a> · {article.topic}
      </p>
    </div>
  );
}
