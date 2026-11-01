import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TransferCreditsButton } from '../components/classes/TransferCreditsButton';
import { MonthlyCalculationBar, MonthlyCalculationPill } from '../components/classes/MonthlyCalculationBar';
import { TopStudentPodiumCard } from '../components/classes/StudentRankCard';
import { WordBankVocabCard, WordBankCardList } from '../components/classes/WordBankVocabCard';
import * as fs from 'fs';
import * as path from 'path';

describe('Theme Polish: Buttons, Cover Hover & Top 3 Podium', () => {
  describe('TransferCreditsButton', () => {
    it('renders with paper airplane icon, text, and calls onClick', () => {
      const handleTransfer = vi.fn();
      render(<TransferCreditsButton onTransferCredits={handleTransfer} />);

      const button = screen.getByRole('button', { name: /Transfer credits/i });
      expect(button).toBeDefined();
      expect(button.className).toContain('bg-white');
      expect(button.className).toContain('text-slate-800');
      expect(button.className).toContain('dark:text-amber-300');

      fireEvent.click(button);
      expect(handleTransfer).toHaveBeenCalledTimes(1);
    });
  });

  describe('MonthlyCalculationBar & MonthlyCalculationPill', () => {
    it('renders pill with label and handles active state', () => {
      const { rerender } = render(<MonthlyCalculationPill label="Daya - 66.5H View details" isActive={false} />);
      const pill = screen.getByRole('button', { name: /Daya - 66.5H View details/i });
      expect(pill.className).toContain('bg-white');
      expect(pill.className).toContain('text-slate-700');

      rerender(<MonthlyCalculationPill label="Daya - 66.5H View details" isActive={true} />);
      expect(pill.className).toContain('bg-amber-400/20');
      expect(pill.className).toContain('border-amber-400');
      expect(pill.className).toContain('text-amber-950');
    });

    it('renders bar with multiple items and invokes callback on item click', () => {
      const handleSelect = vi.fn();
      const items = [
        { id: '1', label: 'School A - 20H', active: true },
        { id: '2', label: 'School B - 40H', active: false },
      ];
      render(<MonthlyCalculationBar items={items} onSelect={handleSelect} />);

      const schoolB = screen.getByRole('button', { name: /School B - 40H/i });
      fireEvent.click(schoolB);
      expect(handleSelect).toHaveBeenCalledWith('2');
    });
  });

  describe('WordBankVocabCard Cover Hover & Action Pills', () => {
    const mockList: WordBankCardList = {
      id: 'list-sample',
      title: 'Halloween Sweet',
      word_count: 3,
      cover_image_url: 'https://example.com/cover.png',
      author_name: 'Teacher Ayman',
    };

    it('renders Change Cover button inside hover overlay and handles click', () => {
      const handleChangeCover = vi.fn();
      render(
        <WordBankVocabCard
          list={mockList}
          onOpenFlashcards={vi.fn()}
          onChangeCover={handleChangeCover}
          canManage={true}
        />
      );

      const changeCoverBtn = screen.getByRole('button', { name: /Change Cover/i });
      expect(changeCoverBtn).toBeDefined();
      fireEvent.click(changeCoverBtn);
      expect(handleChangeCover).toHaveBeenCalledWith(mockList);
    });

    it('has light-mode styling on Flashcards and Assign pills', () => {
      render(
        <WordBankVocabCard
          list={mockList}
          onOpenFlashcards={vi.fn()}
          onAssignToClass={vi.fn()}
        />
      );

      const flashcardsBtn = screen.getByRole('button', { name: /Flashcards/i });
      const assignBtn = screen.getByRole('button', { name: /Assign/i });

      expect(flashcardsBtn.className).toContain('bg-amber-50');
      expect(flashcardsBtn.className).toContain('text-amber-800');
      expect(assignBtn.className).toContain('bg-slate-50');
      expect(assignBtn.className).toContain('text-slate-700');
    });
  });

  describe('TopStudentPodiumCard (StudentRankCard)', () => {
    it('renders Rank 1 Grand Champion card with gold styling and details', () => {
      const onEdit = vi.fn();
      render(
        <TopStudentPodiumCard
          rank={1}
          title="GRAND CHAMPION"
          name="Ash Ketchum"
          coins={1250}
          pokemonCount={150}
          avatarUrl="https://example.com/pikachu.png"
          badges={['Master Trainer', 'Poké Champion']}
          onEdit={onEdit}
        />
      );

      expect(screen.getByText('GRAND CHAMPION')).toBeDefined();
      expect(screen.getByText('GLOBAL #1')).toBeDefined();
      expect(screen.getByText('Ash Ketchum')).toBeDefined();
      expect(screen.getByText(/1250 coins/i)).toBeDefined();
      expect(screen.getByText(/150 Pokémon/i)).toBeDefined();
      expect(screen.getByText('Master Trainer')).toBeDefined();

      const editBtn = screen.getByRole('button', { name: /Edit Ash Ketchum/i });
      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('renders Rank 2 Mythic Elite card with silver styling', () => {
      render(
        <TopStudentPodiumCard
          rank={2}
          title="MYTHIC ELITE"
          name="Gary Oak"
          coins={950}
          pokemonCount={110}
          avatarUrl="https://example.com/blastoise.png"
        />
      );

      expect(screen.getByText('MYTHIC ELITE')).toBeDefined();
      expect(screen.getByText('GLOBAL #2')).toBeDefined();
      expect(screen.getByText('Gary Oak')).toBeDefined();
    });

    it('renders Rank 3 Legendary Ace card with bronze styling', () => {
      render(
        <TopStudentPodiumCard
          rank={3}
          title="LEGENDARY ACE"
          name="Red"
          coins={800}
          pokemonCount={90}
          avatarUrl="https://example.com/charizard.png"
        />
      );

      expect(screen.getByText('LEGENDARY ACE')).toBeDefined();
      expect(screen.getByText('GLOBAL #3')).toBeDefined();
      expect(screen.getByText('Red')).toBeDefined();
    });
  });

  describe('CSS Theme Safeguards', () => {
    it('bright-fixes.css contains overrides for hover overlay and buttons', () => {
      const css = fs.readFileSync(path.join(__dirname, '../../public/pokeayman/bright-fixes.css'), 'utf-8');
      expect(css).toContain('.vocab-cover-hover-overlay');
      expect(css).toContain('rgba(15, 23, 42, 0.25)');
      expect(css).toContain('#btn-transfer-credits');
      expect(css).toContain('.monthly-school-trigger');
      expect(css).toContain('.global-rank-1');
      expect(css).toContain('.rank-title strong');
      expect(css).toContain('.vocab-assign-pill');
      expect(css).toContain('.vocab-flashcard-pill');
      expect(css).toContain('.teacher-zone-list-author');
      expect(css).toContain('.vocab-list-context-pill');
      expect(css).toContain('#profile-adjust-amount');
      expect(css).toContain('.student-roster-edit');
      expect(css).toContain('.student-roster-remove');
      expect(css).toContain('.shop-rarity-segments');
    });

    it('index.html contains bright mode styles for teacher-vb action pills and meta', () => {
      const html = fs.readFileSync(path.join(__dirname, '../../public/pokeayman/index.html'), 'utf-8');
      expect(html).toContain('#teacher-vb-lists-grid .vocab-flashcard-pill');
      expect(html).toContain('#teacher-vb-lists-grid .vocab-assign-pill');
      expect(html).toContain(':is(html body.ts-bright');
      expect(html).toContain('vocab-list-context-pill');
      expect(html).toContain('teacher-zone-wordbank-meta');
    });
  });

  describe('Bright Mode Performance Safeguards', () => {
    it('bright-fixes.js does not contain synchronous canvas getImageData sweep loop', () => {
      const js = fs.readFileSync(path.join(__dirname, '../../public/pokeayman/bright-fixes.js'), 'utf-8');
      expect(js).not.toContain('getImageData');
      expect(js).not.toContain('ctx.fillRect');
      expect(js).not.toContain('attributeFilter: [\'class\', \'style\']');
    });
  });
});
