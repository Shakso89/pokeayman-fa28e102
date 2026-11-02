import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export interface GameDeckItem {
  id: string;
  title: string;
  img: string;
  desc: string;
  fn?: string;
  proOnly?: boolean;
}

export const GAMES: GameDeckItem[] = [
  { id: 'dots_boxes', title: 'Dots & Boxes', img: '/pokeayman/assets/games/dots-and-boxes.jpg', desc: 'Answer questions to draw lines and claim boxes.', fn: 'chooseDotsAndBoxes' },
  { id: 'surprise_boxes', title: 'Surprise Boxes', img: '/pokeayman/assets/games/surprise-boxes.jpg', desc: 'Open mystery boxes full of power-ups.', fn: 'chooseBaamboozlePowerUps' },
  { id: 'match_words', title: 'Match Words', img: '/pokeayman/assets/games/match-words.jpg', desc: 'Race to match each word with its picture.', fn: 'chooseMatchWordCount' },
  { id: 'memory_flip', title: 'Memory Flip', img: '/pokeayman/assets/games/memory-flip.jpg', desc: 'Flip the tiles and find the matching pairs.', fn: 'chooseMemoryDifficulty' },
  { id: 'unscramble', title: 'Unscramble', img: '/pokeayman/assets/games/unscramble.jpg', desc: 'Put the mixed-up letters back in order.', fn: 'chooseScrambleWordCount' },
  { id: 'hangman', title: 'Hangman', img: '/pokeayman/assets/games/hangman.jpg', desc: 'Guess the secret word letter by letter.', fn: 'chooseHangmanWordCount' },
  { id: 'crosswords', title: 'Crosswords', img: '/pokeayman/assets/games/crosswords.jpg', desc: 'Solve vocabulary clues and fill the intersecting word grid.', fn: 'chooseCrossword' },
  { id: 'find_me', title: 'Find Me', img: '/pokeayman/assets/games/find-me.jpg', desc: 'Spot the right word as fast as you can.', fn: 'chooseFindMeScore' },
  { id: 'listen_catch', title: 'Listen and Catch', img: '/pokeayman/assets/games/listen-catch.jpg', desc: 'Hear a word, catch the right answer, and fill your Catchdex.', fn: 'startListenCatch', proOnly: true },
  { id: 'poke_battle', title: 'Poké Battle', img: '/pokeayman/assets/games/poke-battle.jpg', desc: 'Defeat a wild Pokémon and send its reward to your teacher for approval.', fn: 'startVocabBattle', proOnly: true },
];

export interface GameDeckCarouselProps {
  onSelectGame: (id: string) => void;
  games?: GameDeckItem[];
}

export const GameDeckCarousel: React.FC<GameDeckCarouselProps> = ({
  onSelectGame,
  games = GAMES,
}) => {
  const gamesList = games && games.length ? games : GAMES;
  const [activeIndex, setActiveIndex] = useState(() => Math.floor(gamesList.length / 2));

  const handlePrev = () => setActiveIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setActiveIndex((prev) => Math.min(gamesList.length - 1, prev + 1));

  const activeGame = gamesList[activeIndex] || gamesList[0];

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 overflow-hidden" data-testid="game-deck-carousel">
      {/* Step Header */}
      <div className="text-center mb-12">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step 1</h2>
        <h1 className="text-3xl font-black text-white tracking-tight">Choose a Game to Play</h1>
        <p className="text-sm text-slate-400 mt-2">Select a game below, then pick the vocabulary lists.</p>
      </div>

      {/* 3D Fanned Deck Container */}
      <div className="relative w-full h-[400px] flex items-center justify-center perspective-[1200px]" data-testid="deck-container">
        {gamesList.map((game, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isCenter = offset === 0;

          // Fanning Math (mimicking the homepage arc)
          const translateX = offset * 130; // Spread out horizontally
          const translateY = absOffset * 35; // Push outer cards down to form an arc
          const rotateZ = offset * 10; // Rotate outer cards
          const scale = isCenter ? 1.15 : Math.max(0.85, 1 - absOffset * 0.05); // Center pops out
          const zIndex = 50 - absOffset; // Center is on top
          const opacity = absOffset > 3 ? 0 : 1; // Hide cards outside the viewable arc

          return (
            <div
              key={game.id}
              onClick={() => setActiveIndex(index)}
              data-testid={`deck-card-${game.id}`}
              className="absolute top-0 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer origin-bottom select-none"
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotateZ(${rotateZ}deg)`,
                zIndex,
                opacity,
                pointerEvents: opacity === 0 ? 'none' : 'auto',
              }}
            >
              {/* Polaroid-Style Card (Matching Homepage UI exactly) */}
              <div
                className={`w-[220px] h-[310px] bg-white rounded-xl shadow-2xl flex flex-col p-2.5 transition-all ${
                  isCenter ? 'ring-4 ring-amber-400 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'hover:shadow-xl'
                }`}
              >
                {/* Top ID Number */}
                <div className="w-full text-center pb-2 pt-1 text-[11px] font-black text-slate-800 tracking-wider">
                  #{String(index + 1).padStart(3, '0')}
                </div>

                {/* Center Artwork */}
                <div className="w-full flex-1 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200/50">
                  <img
                    src={game.img}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>

                {/* Bottom Title & Subtitle */}
                <div className="w-full text-center pt-4 pb-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none truncate px-1">
                    {game.title}
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 mt-1.5 tracking-[0.2em] uppercase">
                    PokéAyman
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls & Description */}
      <div className="mt-6 max-w-lg w-full flex flex-col items-center">
        <div className="flex items-center gap-6 mb-8 w-full">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous game"
            data-testid="deck-prev-btn"
            className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-white disabled:opacity-30 hover:bg-slate-700 hover:scale-105 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="text-center flex-1">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1" data-testid="deck-counter">
              {String(activeIndex + 1).padStart(2, '0')} / {String(gamesList.length).padStart(2, '0')}
            </div>
            <p className="text-base font-medium text-slate-200 min-h-[48px] flex items-center justify-center" data-testid="deck-desc">
              {activeGame.desc}
            </p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === gamesList.length - 1}
            aria-label="Next game"
            data-testid="deck-next-btn"
            className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-white disabled:opacity-30 hover:bg-slate-700 hover:scale-105 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Proceed Button */}
        <button
          type="button"
          onClick={() => onSelectGame(activeGame.id)}
          data-testid="deck-proceed-btn"
          className="px-10 py-3.5 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer"
        >
          <span>Select {activeGame.title}</span>
          <Play className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};
