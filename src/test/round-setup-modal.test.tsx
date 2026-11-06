import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SettingStepperRow, RoundSetupModal, TIMER_OPTIONS, formatTimer } from '../components/games/RoundSetupModal';

describe('RoundSetupModal and SettingStepperRow', () => {
  it('formats timer intervals correctly and provides comprehensive range from 30s to 15m', () => {
    expect(TIMER_OPTIONS).toEqual([0, 30, 60, 90, 120, 150, 180, 240, 300, 420, 600, 900]);
    expect(formatTimer(0)).toBe('No timer');
    expect(formatTimer(30)).toBe('30s');
    expect(formatTimer(60)).toBe('1m');
    expect(formatTimer(90)).toBe('1m 30s');
    expect(formatTimer(120)).toBe('2m');
    expect(formatTimer(150)).toBe('2m 30s');
    expect(formatTimer(900)).toBe('15m');
  });
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

  it('renders Surprise Boxes setup with Number of Cards and Power-ups stepper, toggling enabled/disabled', () => {
    const onStartGame = vi.fn();
    const students = [
      { id: '1', name: 'Ceanna', avatar_url: '/poke1.png' },
      { id: '2', name: 'Yumi', avatar_url: '/poke2.png' },
    ];

    render(
      <RoundSetupModal
        gameTitle="Surprise Boxes"
        gameId="surprise_boxes"
        classStudents={students}
        onStartGame={onStartGame}
      />
    );

    // Number of cards
    expect(screen.getByText('Number of cards')).toBeInTheDocument();
    expect(screen.getByText('8 cards')).toBeInTheDocument();

    // Power-ups / Enable surprise boxes toggle & stepper
    expect(screen.getByText('Enable surprise boxes')).toBeInTheDocument();
    expect(screen.getByText('Power-ups, traps and score swaps')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();

    // Select players to enable Start Game
    fireEvent.click(screen.getByText('Ceanna'));
    fireEvent.click(screen.getByText('Yumi'));

    // Toggle powerups to disabled using the toggle switch
    const toggleSwitch = screen.getByTestId('surprise-powerups-toggle');
    fireEvent.click(toggleSwitch);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Vocabulary questions only')).toBeInTheDocument();

    // Increase cards to 18
    const cardsInc = screen.getAllByRole('button', { name: '+' })[0];
    fireEvent.click(cardsInc);
    expect(screen.getByText('18 cards')).toBeInTheDocument();

    // Start game
    const startBtn = screen.getByRole('button', { name: /START GAME/i });
    fireEvent.click(startBtn);

    expect(onStartGame).toHaveBeenCalledTimes(1);
    const passedSettings = onStartGame.mock.calls[0][1];
    expect(passedSettings.cardCount).toBe(18);
    expect(passedSettings.powerUpsEnabled).toBe(false);
  });
});
