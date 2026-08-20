import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pager from '../../src/components/Pager';

function setup(over: Partial<React.ComponentProps<typeof Pager>> = {}) {
  const props = {
    label: 'conversation starters',
    page: 2,
    pageCount: 5,
    pageSize: 3,
    total: 15,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    ...over,
  };
  render(<Pager {...props} />);
  return props;
}

describe('Pager', () => {
  it('names its buttons after the section it pages', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Previous conversation starters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next conversation starters' })).toBeInTheDocument();
  });

  it('reads out the current range and the total', () => {
    setup();
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('4–6 of 15');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('reads a single-item range without a dash', () => {
    setup({ page: 3, pageCount: 6, pageSize: 1, total: 6 });
    expect(screen.getByRole('status')).toHaveTextContent('3 of 6');
  });

  it('shortens the final partial page to the real total', () => {
    setup({ page: 5, pageCount: 5, pageSize: 3, total: 13 });
    expect(screen.getByRole('status')).toHaveTextContent('13 of 13');
  });

  // At an end the control is inert but still focusable: `disabled` would drop
  // focus to <body> on the very click that got the reader there, restarting
  // their next Tab at the top of the document.
  it('marks previous inert but focusable on the first page', async () => {
    const props = setup({ page: 1 });
    const prev = screen.getByRole('button', { name: /^Previous/ });
    expect(prev).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: /^Next/ })).toHaveAttribute('aria-disabled', 'false');

    prev.focus();
    await userEvent.click(prev);
    expect(prev).toHaveFocus();
    expect(props.onPrev).not.toHaveBeenCalled();
  });

  it('marks next inert but focusable on the last page', async () => {
    const props = setup({ page: 5, pageCount: 5 });
    const next = screen.getByRole('button', { name: /^Next/ });
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: /^Previous/ })).toHaveAttribute('aria-disabled', 'false');

    next.focus();
    await userEvent.click(next);
    expect(next).toHaveFocus();
    expect(props.onNext).not.toHaveBeenCalled();
  });

  it('calls back when a control is used', async () => {
    const props = setup();
    await userEvent.click(screen.getByRole('button', { name: /^Next/ }));
    await userEvent.click(screen.getByRole('button', { name: /^Previous/ }));
    expect(props.onNext).toHaveBeenCalledOnce();
    expect(props.onPrev).toHaveBeenCalledOnce();
  });

  it('renders nothing at all when the set fits on one page', () => {
    const { container } = render(
      <Pager label="sports" page={1} pageCount={1} pageSize={3} total={2} onPrev={vi.fn()} onNext={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
