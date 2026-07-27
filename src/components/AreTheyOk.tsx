import type { Article } from '../types';
import Thumb from './Thumb';

export default function AreTheyOk({ article, eyebrow }: { article: Article; eyebrow: string }) {
  return (
    <div className="oneb-card">
      <h2 className="oneb-section-heading oneb-section-heading--plain">{eyebrow}</h2>
      <div className="oneb-card-top">
        <Thumb article={article} lead />
        <h3 className="oneb-headline">{article.title}</h3>
      </div>
      <p className="oneb-lead">{article.description}</p>
      {article.summary && <p className="oneb-lead oneb-lead--summary">{article.summary}</p>}
      <p className="oneb-meta">
        {article.dateLabel && <>{article.dateLabel} · </>}
        <a href={article.url} className="oneb-source-link" target="_blank" rel="noopener noreferrer">{article.source}</a> · {article.topic}
      </p>
    </div>
  );
}
