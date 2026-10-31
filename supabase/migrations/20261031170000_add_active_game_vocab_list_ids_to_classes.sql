-- Migration: Add active_game_vocab_list_ids to classes
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS active_game_vocab_list_ids UUID[] DEFAULT '{}';
