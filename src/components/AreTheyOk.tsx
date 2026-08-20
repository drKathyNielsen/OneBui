import type { Article } from '../types';
import type { PagerStrings } from '../data/strings';
import { usePaging } from '../hooks/usePaging';
import Thumb from './Thumb';
import ArticleFeedback from './ArticleFeedback';
import ArticleQuestions from './ArticleQuestions';
import Pager from './Pager';

// One hero at a time: the section's problem was vertical weight, so paging it
// three-at-a-time would reintroduce the stacking this replaced.
const PAGE_SIZE = 1;

interface Props {
  articles: Article[]; // complete ordered candidate set (weeklies carry six)
  eyebrow: string;
  emptyNote?: string;
  pager: PagerStrings;
  questionsLabel: string;
}

export default function AreTheyOk({ articles, eyebrow, emptyNote, pager, questionsLabel }: Props) {
  const { visible, page, pageCount, next, prev } = usePaging(articles, PAGE_SIZE);
  const article = visible[0];

  return (
    <div className="oneb-card">
      <h2 className="oneb-section-heading oneb-section-heading--plain"><span className="oneb-section-heading-badge">{eyebrow}</span></h2>
      {!article ? (
        <p className="oneb-empty">{emptyNote}</p>
      ) : (
        <>
          <div className="oneb-card-top">
            <Thumb article={article} lead />
            <div className="oneb-card-top-text">
              <h3 className="oneb-headline">{article.title}</h3>
              <p className="oneb-lead">{article.description}</p>
            </div>
          </div>
          {article.summary && <p className="oneb-lead oneb-lead--summary">{article.summary}</p>}
          <ArticleQuestions questions={article.questions} label={questionsLabel} />
          <p className="oneb-meta">
            {article.dateLabel && <>{article.dateLabel} · </>}
            <a href={article.url} className="oneb-source-link" target="_blank" rel="noopener noreferrer">{article.source}</a> · {article.topic}
          </p>
          {/* Keyed: the hero swaps in place as the reader pages, so without a
              key React would keep one ArticleFeedback instance and carry its
              vote state onto the next lead. */}
          <ArticleFeedback key={article.uid ?? article.url} uid={article.uid} title={article.title} />
          <Pager
            label={eyebrow.toLowerCase()}
            page={page}
            pageCount={pageCount}
            pageSize={PAGE_SIZE}
            total={articles.length}
            prevText={pager.prev}
            nextText={pager.next}
            onPrev={prev}
            onNext={next}
          />
        </>
      )}
    </div>
  );
}
