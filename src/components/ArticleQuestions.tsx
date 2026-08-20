import { accessibleName } from '../utils/format';

interface Props {
  questions?: string[]; // generator-emitted openers; absent on most you-should-know items
  label: string; // per-style group label, e.g. "Ways to bring it up"
}

// Conversational openers for one article, rendered as a labelled list so a screen
// reader hears them as a group belonging to this story rather than as loose text
// between articles (see openspec/specs/conversation-questions).
export default function ArticleQuestions({ questions, label }: Props) {
  const usable = (questions ?? []).filter((q) => q.trim() !== '');
  if (usable.length === 0) return null;

  return (
    <ul className="oneb-questions list-unstyled" aria-label={accessibleName(label)}>
      {/* Index keys: the list is static per article and the openers are not
          guaranteed unique, so the text is not a usable identity. */}
      {usable.map((q, i) => (
        <li className="oneb-question" key={i}>{q}</li>
      ))}
    </ul>
  );
}
