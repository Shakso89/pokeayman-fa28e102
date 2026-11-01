import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WordBankVocabCard, WordBankCardList } from '../components/classes/WordBankVocabCard';

describe('WordBankVocabCard Component', () => {
  const mockList: WordBankCardList = {
    id: 'list-123',
    title: 'Halloween Sweet',
    word_count: 5,
    cover_image_url: 'https://example.com/sweet.jpg',
    author_name: 'Teacher Ayman',
    school_name: 'Stanford',
    class_name: 'ESL',
  };

  it('renders title, author, count, and context tags', () => {
    const onOpenFlashcards = vi.fn();
    render(<WordBankVocabCard list={mockList} onOpenFlashcards={onOpenFlashcards} />);

    expect(screen.getByText('Halloween Sweet')).toBeDefined();
    expect(screen.getByText('By Teacher Ayman')).toBeDefined();
    expect(screen.getByText('5 words')).toBeDefined();
    expect(screen.getByText(/Stanford · ESL/)).toBeDefined();
  });

  it('omits Game Access Toggle button (Game: ON/OFF)', () => {
    const onOpenFlashcards = vi.fn();
    render(<WordBankVocabCard list={mockList} onOpenFlashcards={onOpenFlashcards} />);

    expect(screen.queryByText(/Game: ON/i)).toBeNull();
    expect(screen.queryByText(/Game: OFF/i)).toBeNull();
  });

  it('triggers onOpenFlashcards when Flashcards button or image is clicked', () => {
    const onOpenFlashcards = vi.fn();
    render(<WordBankVocabCard list={mockList} onOpenFlashcards={onOpenFlashcards} />);

    const flashcardsBtn = screen.getByRole('button', { name: /Flashcards/i });
    fireEvent.click(flashcardsBtn);
    expect(onOpenFlashcards).toHaveBeenCalledWith(mockList);
  });

  it('renders top-right Edit and Delete vector icon buttons when canManage is true', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <WordBankVocabCard
        list={mockList}
        onOpenFlashcards={vi.fn()}
        onEditList={onEdit}
        onDeleteList={onDelete}
        canManage={true}
      />
    );

    const editBtn = screen.getByLabelText('Edit Halloween Sweet');
    const deleteBtn = screen.getByLabelText('Delete Halloween Sweet');

    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockList);

    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockList);
  });

  it('renders Assign button and triggers onAssignToClass', () => {
    const onAssign = vi.fn();
    render(
      <WordBankVocabCard
        list={mockList}
        onOpenFlashcards={vi.fn()}
        onAssignToClass={onAssign}
      />
    );

    const assignBtn = screen.getByRole('button', { name: /Assign/i });
    fireEvent.click(assignBtn);
    expect(onAssign).toHaveBeenCalledWith(mockList);
  });
});
