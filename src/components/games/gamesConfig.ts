export interface GameConfig {
  id: string;
  title: string;
  description: string;
  tags: string[];
  minPlayers: number;
  maxPlayers: number;
  defaultGridSize?: number;
  accent?: string;
  icon?: string;
}

export const GAMES_CONFIG: GameConfig[] = [
  {
    id: 'dots_and_boxes',
    title: 'Dots and Boxes',
    description: 'Answer vocabulary questions to draw lines, claim boxes, and outsmart your opponent.',
    tags: ['2-Player', 'Strategy', 'Vocab MCQ'],
    minPlayers: 2,
    maxPlayers: 2,
    defaultGridSize: 4, // 4x4 dots = 3x3 boxes (9 total boxes)
    accent: 'amber',
    icon: '⚄',
  },
  {
    id: 'match_words',
    title: 'Match Words',
    description: 'Race to match each word with its picture.',
    tags: ['1–4 players', 'Fast reflexes'],
    minPlayers: 1,
    maxPlayers: 4,
    accent: 'red',
    icon: '🎯',
  },
  {
    id: 'memory_flip',
    title: 'Memory Flip',
    description: 'Flip the tiles and find the matching pairs.',
    tags: ['1–4 players', 'Focus'],
    minPlayers: 1,
    maxPlayers: 4,
    accent: 'violet',
    icon: '🧠',
  },
  {
    id: 'surprise_boxes',
    title: 'Surprise Boxes',
    description: 'Open mystery boxes full of power-ups, traps and score swaps.',
    tags: ['1–4 players', 'Class favourite'],
    minPlayers: 1,
    maxPlayers: 4,
    accent: 'pink',
    icon: '🎁',
  },
];

export const gamesConfig = GAMES_CONFIG;

export const getGameConfig = (id: string): GameConfig | undefined => {
  return GAMES_CONFIG.find((game) => game.id === id);
};
