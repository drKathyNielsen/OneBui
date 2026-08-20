import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticleList from '../../src/components/ArticleList';
import type { Article } from '../../src/types';

const PAGER = { prev: 'Previous', next: 'Next' };

function items(n: number): Article[] {
  return Array.from({ length: n }, (_, i) => ({
    title: `Story ${i + 1}`,
    description: `Description ${i + 1}`,
    source: 'Example News',
    topic: 'civic events',
    url: `https://example.test/${i + 1}`,
    uid: `uid-${i + 1}`,
  }));
}

function renderList(list: Article[]) {
  return render(
    <ArticleList
      heading="Conversation starters"
      items={list}
      emptyNote="No conversation starters this time."
      blurb="Local stories worth bringing up next time you talk."
      pager={PAGER}
      questionsLabel="Ways to bring it up"
    />
  );
}

const titles = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
const next = () => screen.getByRole('button', { name: 'Next conversation starters' });
const prev = () => screen.getByRole('button', { name: 'Previous conversation starters' });

describe('ArticleList paging', () => {
  it('shows one page at a time and reaches every item in generator order', async () => {
    const user = userEvent.setup();
    renderList(items(15));

    expect(titles()).toEqual(['Story 1', 'Story 2', 'Story 3']);

    const seen: string[] = [];
    for (let page = 0; page < 5; page++) {
      seen.push(...titles().map((t) => t!));
      if (page < 4) await user.click(next());
    }
    expect(seen).toEqual(items(15).map((i) => i.title));
  });

  it('pages back to earlier items', async () => {
    const user = userEvent.setup();
    renderList(items(15));
    await user.click(next());
    expect(titles()).toEqual(['Story 4', 'Story 5', 'Story 6']);
    await user.click(prev());
    expect(titles()).toEqual(['Story 1', 'Story 2', 'Story 3']);
  });

  it('keeps the topic label and the feedback control on the last page', async () => {
    const user = userEvent.setup();
    renderList(items(15));
    for (let i = 0; i < 4; i++) await user.click(next());

    expect(titles()).toEqual(['Story 13', 'Story 14', 'Story 15']);
    expect(screen.getAllByText(/civic events/)).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: /Story 1[345]/ }).length).toBeGreaterThanOrEqual(6);
  });

  it('renders the heading and empty note with no pager when there are no items', () => {
    renderList([]);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Conversation starters');
    expect(screen.getByText('No conversation starters this time.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument();
  });

  it('renders no pager when the whole set fits on one page', () => {
    renderList(items(3));
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument();
  });

  it('renders an item’s conversational openers', () => {
    const list = items(1);
    list[0].questions = ['Did you see this?', 'Have you been by there?'];
    renderList(list);
    expect(screen.getByRole('list', { name: 'Ways to bring it up' })).toBeInTheDocument();
    expect(screen.getByText('Did you see this?')).toBeInTheDocument();
  });

  it('renders no openers container for an item without questions', () => {
    renderList(items(1));
    expect(screen.queryByRole('list', { name: 'Ways to bring it up' })).not.toBeInTheDocument();
  });
});
