import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AreTheyOk from '../../src/components/AreTheyOk';
import type { Article } from '../../src/types';

const PAGER = { prev: 'Previous', next: 'Next' };

function leads(n: number): Article[] {
  return Array.from({ length: n }, (_, i) => ({
    title: `Lead ${i + 1}`,
    description: `Description ${i + 1}`,
    source: 'Example News',
    topic: 'flood',
    url: `https://example.test/${i + 1}`,
    uid: `uid-${i + 1}`,
  }));
}

function renderLeads(articles: Article[]) {
  return render(
    <AreTheyOk
      articles={articles}
      eyebrow="Top story"
      emptyNote="No urgent local concerns to flag."
      pager={PAGER}
      questionsLabel="Ways to bring it up"
    />
  );
}

const headlines = () => screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent);

describe('AreTheyOk', () => {
  it('renders one hero at a time and pages through every lead', async () => {
    const user = userEvent.setup();
    renderLeads(leads(6));

    const seen: string[] = [];
    for (let page = 0; page < 6; page++) {
      expect(headlines()).toHaveLength(1);
      seen.push(headlines()[0]!);
      if (page < 5) await user.click(screen.getByRole('button', { name: 'Next top story' }));
    }
    expect(seen).toEqual(leads(6).map((l) => l.title));
  });

  it('keeps the feedback control on the last lead', async () => {
    const user = userEvent.setup();
    renderLeads(leads(6));
    for (let i = 0; i < 5; i++) await user.click(screen.getByRole('button', { name: 'Next top story' }));
    expect(screen.getByRole('group', { name: 'Was "Lead 6" helpful?' })).toBeInTheDocument();
  });

  it('renders the eyebrow and empty note with no pager when there are no leads', () => {
    renderLeads([]);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Top story');
    expect(screen.getByText('No urgent local concerns to flag.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument();
  });

  it('renders no pager for a single lead', () => {
    renderLeads(leads(1));
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument();
  });

  it('renders the lead’s conversational openers', () => {
    const one = leads(1);
    one[0].questions = ['Are your folks nearby?'];
    renderLeads(one);
    expect(screen.getByRole('list', { name: 'Ways to bring it up' })).toBeInTheDocument();
  });

  it('does not carry a vote from one lead to the next', async () => {
    const user = userEvent.setup();
    renderLeads(leads(3));

    await user.click(screen.getByRole('button', { name: 'Mark "Lead 1" as helpful' }));
    expect(screen.getByRole('button', { name: 'Mark "Lead 1" as helpful' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /^Next/ }));

    // The hero swaps in place, so the feedback control must remount with the
    // article rather than keeping the previous lead's vote state.
    expect(screen.getByRole('button', { name: 'Mark "Lead 2" as helpful' })).toHaveAttribute('aria-pressed', 'false');
  });
});
