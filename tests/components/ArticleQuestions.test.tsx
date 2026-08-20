import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArticleQuestions from '../../src/components/ArticleQuestions';

const prompts = ['Did the storm hit your block?', 'Have you driven past it yet?'];

describe('ArticleQuestions', () => {
  it('renders every prompt verbatim inside a labelled group', () => {
    render(<ArticleQuestions questions={prompts} label="Ways to bring it up" />);
    const group = screen.getByRole('list', { name: 'Ways to bring it up' });
    expect(group).toBeInTheDocument();
    for (const prompt of prompts) {
      expect(screen.getByText(prompt)).toBeInTheDocument();
    }
  });

  it.each([
    ['absent', undefined],
    ['empty', []],
    ['all blank', ['', '   ']],
  ])('renders no container at all when questions are %s', (_case, questions) => {
    const { container } = render(<ArticleQuestions questions={questions} label="Ways to bring it up" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('drops blank entries but keeps the usable ones', () => {
    render(<ArticleQuestions questions={['', 'Still worth asking?']} label="Ways to bring it up" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('renders repeated openers as separate items without duplicate keys', () => {
    // The generator does not de-duplicate, and question text is not a stable id.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ArticleQuestions questions={['How are they doing?', 'How are they doing?']} label="Ways to bring it up" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
