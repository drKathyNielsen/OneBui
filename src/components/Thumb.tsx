import type { Article } from '../types';

interface Props {
  article: Article;
  lead?: boolean; // larger variant for the "Are they ok?" lead card
}

// Article thumbnail. When the item has no image, fall back to the source's logo,
// then to the source name set inside the tile, so the layout stays aligned
// instead of showing an empty box. Both fallbacks are decorative (the source is
// already named in the meta line).
export default function Thumb({ article, lead }: Props) {
  const className = `oneb-thumb${lead ? ' oneb-thumb--lead' : ''}`;
  if (article.image) {
    return (
      <div className={className}>
        <img src={article.image} alt={article.alt ?? ''} />
      </div>
    );
  }
  if (article.logo) {
    return (
      <div className={`${className} oneb-thumb--logo`} aria-hidden="true">
        <img src={article.logo} alt="" />
      </div>
    );
  }
  return (
    <div className={`${className} oneb-thumb--placeholder`} aria-hidden="true">
      <span className="oneb-thumb-name">{article.source.trim()}</span>
    </div>
  );
}
