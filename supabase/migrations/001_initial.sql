CREATE TABLE IF NOT EXISTS daily_puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game text NOT NULL,
  puzzle_date date NOT NULL,
  puzzle_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game, puzzle_date)
);

CREATE INDEX idx_daily_puzzles_game_date ON daily_puzzles(game, puzzle_date);
