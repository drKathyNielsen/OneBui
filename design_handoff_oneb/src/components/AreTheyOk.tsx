import type { Article, Style } from '../types';

export default function AreTheyOk({ article, style }: { article: Article; style: Style }) {
  return (
    <div className="oneb-card">
      <p className="oneb-eyebrow">Are they ok?</p>
      <h2 className="oneb-headline">{article.title}</h2>
      {style === 'classic' && article.dropCap ? (
        <p className="oneb-lead" aria-label={article.dropCap + article.descRest}>
          <span className="oneb-dropcap" aria-hidden="true">{article.dropCap}</span>
          <span aria-hidden="true">{article.descRest}</span>
        </p>
      ) : (
        <p className="oneb-lead">{article.description}</p>
      )}
      <p className="oneb-meta">
        <a href={article.url} className="oneb-source-link">{article.source}</a> · {article.topic}
      </p>
    </div>
  );
}
