import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sports from './Sports';

const PAGER = { prev: 'Previous', next: 'Next' };

const teams = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ team: `Team ${i + 1}`, scores: [`won ${i + 1}-0`] }));

function renderSports(list: { team: string; scores: string[] }[]) {
  return render(
    <Sports sports={list} heading="Sporting news" emptyNote="No games to report." pager={PAGER} />
  );
}

const names = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

describe('Sports', () => {
  it('pages three teams at a time through the whole set', async () => {
    const user = userEvent.setup();
    renderSports(teams(6));

    expect(names()).toEqual(['Team 1', 'Team 2', 'Team 3']);
    await user.click(screen.getByRole('button', { name: 'Next sporting news' }));
    expect(names()).toEqual(['Team 4', 'Team 5', 'Team 6']);
    await user.click(screen.getByRole('button', { name: 'Previous sporting news' }));
    expect(names()).toEqual(['Team 1', 'Team 2', 'Team 3']);
  });

  it('keeps every line of a team on the page it appears on', async () => {
    const user = userEvent.setup();
    const list = teams(6);
    list[3].scores = ['won 4-0', 'signs goalie to extension'];
    renderSports(list);
    await user.click(screen.getByRole('button', { name: 'Next sporting news' }));
    expect(screen.getByText('signs goalie to extension')).toBeInTheDocument();
  });

  it('renders the heading and empty note with no pager when there are no teams', () => {
    renderSports([]);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sporting news');
    expect(screen.getByText('No games to report.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument();
  });

  it('renders no pager when the teams fit on one page', () => {
    renderSports(teams(3));
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument();
  });
});
