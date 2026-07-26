import type { Article } from '../types';

interface Props {
  article: Article;
  lead?: boolean; // larger variant for the "Are they ok?" lead card
}

// Article thumbnail. When the item has no image, fall back to a monogram of the
// source's first letter so the layout stays aligned instead of showing an empty
// box. The placeholder is decorative (source is already in the meta line).
export default function Thumb({ article, lead }: Props) {
  const className = `oneb-thumb${lead ? ' oneb-thumb--lead' : ''}`;
  if (article.image) {
    return (
      <div className={className}>
        <img src={article.image} alt={article.alt ?? ''} />
      </div>
    );
  }
  const initial = article.source.trim().charAt(0).toUpperCase();
  return (
    <div className={`${className} oneb-thumb--placeholder`} aria-hidden="true">
      <span className="oneb-thumb-mono">{initial}</span>
    </div>
  );
}
