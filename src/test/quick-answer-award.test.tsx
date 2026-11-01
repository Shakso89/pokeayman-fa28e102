import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QuickAnswerAward, REWARD_PRESETS } from '../components/classes/QuickAnswerAward';

describe('QuickAnswerAward Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockStudents = [
    { id: 'student-1', name: 'Ayman', avatar_url: '/poke1.png', coins: 15 },
    { id: 'student-2', name: 'Ceanna', avatar_url: '/poke2.png', coins: 20 },
  ];

  it('renders with default 5 coins and displays correct badges and subtitle', () => {
    render(<QuickAnswerAward students={mockStudents} />);

    expect(screen.getByText('Quick Answer Award')).toBeInTheDocument();
    expect(screen.getByText('+5 coins')).toBeInTheDocument();
    expect(screen.getAllByText('+5').length).toBeGreaterThanOrEqual(2); // In preset button and student cards
  });

  it('updates reward amount when a preset button is clicked and stores in localStorage', () => {
    render(<QuickAnswerAward students={mockStudents} />);

    const preset10Btn = screen.getByRole('button', { name: '+10' });
    fireEvent.click(preset10Btn);

    expect(screen.getByText('+10 coins')).toBeInTheDocument();
    expect(localStorage.getItem('quick_award_amount')).toBe('10');

    // Both student badges should now show +10
    const studentBadges = screen.getAllByText('+10');
    expect(studentBadges.length).toBeGreaterThanOrEqual(2);
  });

  it('increments and decrements reward amount with stepper buttons', () => {
    render(<QuickAnswerAward students={mockStudents} />);

    const decBtn = screen.getByRole('button', { name: 'Decrease reward amount' });
    const incBtn = screen.getByRole('button', { name: 'Increase reward amount' });

    // Decrement from 5 to 4
    fireEvent.click(decBtn);
    expect(screen.getByText('+4 coins')).toBeInTheDocument();
    expect(localStorage.getItem('quick_award_amount')).toBe('4');

    // Increment from 4 to 5, then 6
    fireEvent.click(incBtn);
    fireEvent.click(incBtn);
    expect(screen.getByText('+6 coins')).toBeInTheDocument();
    expect(localStorage.getItem('quick_award_amount')).toBe('6');
  });

  it('calls onAwardCoins with the selected reward amount when a student is clicked', async () => {
    const onAwardCoins = vi.fn();
    const triggerCoinPop = vi.fn();

    render(
      <QuickAnswerAward
        students={mockStudents}
        onAwardCoins={onAwardCoins}
        triggerCoinPopAnimation={triggerCoinPop}
      />
    );

    // Select +20 preset
    fireEvent.click(screen.getByRole('button', { name: '+20' }));
    expect(screen.getByText('+20 coins')).toBeInTheDocument();

    // Click Ayman
    const aymanBtn = screen.getByRole('button', { name: /Ayman/i });
    fireEvent.click(aymanBtn);

    expect(triggerCoinPop).toHaveBeenCalledWith('student-1', 20);
    expect(onAwardCoins).toHaveBeenCalledWith('student-1', 20);
  });
});
