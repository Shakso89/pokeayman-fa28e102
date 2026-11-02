import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameDeckCarousel, GAMES } from '../components/games/GameDeckCarousel';

describe('GameDeckCarousel Component', () => {
  it('renders Step 1 header and Polaroid-style game cards', () => {
    const handleSelect = vi.fn();
    render(<GameDeckCarousel onSelectGame={handleSelect} />);

    expect(screen.getByText('Step 1')).toBeDefined();
    expect(screen.getByText('Choose a Game to Play')).toBeDefined();
    expect(screen.getByTestId('deck-container')).toBeDefined();

    // Verify games are rendered with Polaroid branding
    expect(screen.getAllByText('PokéAyman').length).toBeGreaterThan(0);
    expect(screen.getByText('Dots & Boxes')).toBeDefined();
  });

  it('centers the initial card and applies active styling and heavy shadow', () => {
    const handleSelect = vi.fn();
    render(<GameDeckCarousel onSelectGame={handleSelect} />);

    const midIndex = Math.floor(GAMES.length / 2);
    const midGame = GAMES[midIndex];

    const centerCard = screen.getByTestId(`deck-card-${midGame.id}`);
    expect(centerCard).toBeDefined();

    // Active center card has scale(1.15) and rotateZ(0deg)
    expect(centerCard.style.transform).toContain('scale(1.15)');
    expect(centerCard.style.transform).toContain('rotateZ(0deg)');
    expect(centerCard.style.zIndex).toBe('50');

    // Inner card has gold ring
    const innerCard = centerCard.firstElementChild;
    expect(innerCard?.className).toContain('ring-4 ring-amber-400');
  });

  it('rotates a clicked background card into the center active position', () => {
    const handleSelect = vi.fn();
    render(<GameDeckCarousel onSelectGame={handleSelect} />);

    // Click the first game
    const firstGame = GAMES[0];
    const firstCard = screen.getByTestId(`deck-card-${firstGame.id}`);
    fireEvent.click(firstCard);

    // Now first game should be in the center
    expect(firstCard.style.transform).toContain('scale(1.15)');
    expect(firstCard.style.transform).toContain('rotateZ(0deg)');
    expect(firstCard.style.zIndex).toBe('50');

    // Counter shows 01 / 10
    expect(screen.getByTestId('deck-counter').textContent).toContain('01 /');
  });

  it('navigates with previous and next buttons', () => {
    const handleSelect = vi.fn();
    render(<GameDeckCarousel onSelectGame={handleSelect} />);

    const prevBtn = screen.getByTestId('deck-prev-btn');
    const nextBtn = screen.getByTestId('deck-next-btn');

    const midIndex = Math.floor(GAMES.length / 2);
    expect(screen.getByTestId('deck-counter').textContent).toContain(
      `${String(midIndex + 1).padStart(2, '0')} /`
    );

    // Click next
    fireEvent.click(nextBtn);
    expect(screen.getByTestId('deck-counter').textContent).toContain(
      `${String(midIndex + 2).padStart(2, '0')} /`
    );

    // Click prev twice
    fireEvent.click(prevBtn);
    fireEvent.click(prevBtn);
    expect(screen.getByTestId('deck-counter').textContent).toContain(
      `${String(midIndex).padStart(2, '0')} /`
    );
  });

  it('calls onSelectGame when proceed button is clicked', () => {
    const handleSelect = vi.fn();
    render(<GameDeckCarousel onSelectGame={handleSelect} />);

    const midIndex = Math.floor(GAMES.length / 2);
    const midGame = GAMES[midIndex];

    const proceedBtn = screen.getByTestId('deck-proceed-btn');
    expect(proceedBtn.textContent).toContain(`Select ${midGame.title}`);

    fireEvent.click(proceedBtn);
    expect(handleSelect).toHaveBeenCalledWith(midGame.id);
  });
});
