import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SettingStepperRow, RoundSetupModal } from '../components/games/RoundSetupModal';

describe('RoundSetupModal and SettingStepperRow', () => {
  it('renders SettingStepperRow correctly and handles decrease/increase', () => {
    const onDecrease = vi.fn();
    const onIncrease = vi.fn();

    render(
      <SettingStepperRow
        icon={<span>🎯</span>}
        label="Points to win"
        valueDisplay="5 pts"
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        canDecrease={true}
        canIncrease={true}
      />
    );

    expect(screen.getByText('Points to win')).toBeInTheDocument();
    expect(screen.getByText('5 pts')).toBeInTheDocument();

    const decBtn = screen.getByRole('button', { name: '−' });
    const incBtn = screen.getByRole('button', { name: '+' });

    fireEvent.click(decBtn);
    expect(onDecrease).toHaveBeenCalledTimes(1);

    fireEvent.click(incBtn);
    expect(onIncrease).toHaveBeenCalledTimes(1);
  });

  it('renders RoundSetupModal with student roster and quick pick actions', () => {
    const students = [
      { id: '1', name: 'Ceanna', avatar_url: '/poke1.png' },
      { id: '2', name: 'Yumi', avatar_url: '/poke2.png' },
      { id: '3', name: 'Cindy', avatar_url: '/poke3.png' },
      { id: '4', name: 'Sandy', avatar_url: '/poke4.png' },
    ];
    const themes = [
      { id: 'classroom', name: 'Classroom', subtitle: 'Poké Academy & chalkboard' },
      { id: 'halloween', name: 'Halloween', subtitle: 'Haunted manor & lanterns' },
    ];

    render(
      <RoundSetupModal
        gameTitle="Match Words"
        classStudents={students}
        themes={themes}
        selectedThemeId="halloween"
      />
    );

    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('0 / 4 selected')).toBeInTheDocument();
    expect(screen.getByText('· 4 in class')).toBeInTheDocument();
    expect(screen.getByText('Ceanna')).toBeInTheDocument();
    expect(screen.getByText('Yumi')).toBeInTheDocument();

    // Toggle player
    fireEvent.click(screen.getByText('Ceanna'));
    expect(screen.getByText('1 / 4 selected')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();

    // Clear players
    fireEvent.click(screen.getByText('Clear'));
    expect(screen.getByText('0 / 4 selected')).toBeInTheDocument();
  });
});
