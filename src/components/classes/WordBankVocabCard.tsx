import React from 'react';
import { BookOpen, Pencil, Trash2, Share2, Camera } from 'lucide-react';

export interface WordBankCardList {
  id: string;
  title: string;
  word_count: number;
  cover_image_url?: string;
  author_name?: string;
  class_name?: string;
  school_name?: string;
  is_ai_generated?: boolean;
}

export interface WordBankVocabCardProps {
  list: WordBankCardList;
  onOpenFlashcards: (list: WordBankCardList) => void;
  onEditList?: (list: WordBankCardList) => void;
  onDeleteList?: (list: WordBankCardList) => void;
  onAssignToClass?: (list: WordBankCardList) => void;
  onChangeCover?: (list: WordBankCardList) => void;
  canManage?: boolean;
}

export const WordBankVocabCard: React.FC<WordBankVocabCardProps> = ({
  list,
  onOpenFlashcards,
  onEditList,
  onDeleteList,
  onAssignToClass,
  onChangeCover,
  canManage = true,
}) => {
  return (
    <article
      className="group relative p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 text-slate-900 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between dark:bg-slate-900/70 dark:border-slate-800 dark:hover:border-slate-700 dark:text-white"
      data-testid={`word-bank-card-${list.id}`}
    >
      {/* 1. Header: Title, Info & Top-Right Actions */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate" title={list.title}>
            {list.title}
          </h3>
          <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {list.author_name && <span>By {list.author_name}</span>}
            {list.author_name && <span>•</span>}
            <span>{list.word_count || 0} word{(list.word_count || 0) !== 1 ? 's' : ''}</span>
            {list.school_name && (
              <>
                <span>•</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 text-[11px]">
                  {list.school_name} {list.class_name ? `· ${list.class_name}` : ''}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Top-Right Quick Action Icons */}
        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            {onEditList && (
              <button
                type="button"
                onClick={() => onEditList(list)}
                title="Edit list"
                aria-label={`Edit ${list.title}`}
                className="vb-ghost-action-btn p-1.5 rounded-lg border transition bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 active:scale-95"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDeleteList && (
              <button
                type="button"
                onClick={() => onDeleteList(list)}
                title="Delete list"
                aria-label={`Delete ${list.title}`}
                className="vb-ghost-action-btn vb-ghost-delete-btn p-1.5 rounded-lg border transition bg-white border-slate-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:border-slate-700 dark:text-rose-400 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Cover Image Preview with Hover Overlay */}
      <div
        className="relative group/cover w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 mb-3 cursor-pointer flex items-center justify-center"
        onClick={() => onOpenFlashcards(list)}
      >
        {list.cover_image_url ? (
          <img
            src={list.cover_image_url}
            alt={list.title}
            className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-semibold text-xs bg-slate-200/50 dark:bg-slate-950/40">
            No Cover Image
          </div>
        )}

        {canManage && onChangeCover && (
          <div className="vocab-cover-hover-overlay absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center p-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChangeCover(list);
              }}
              className="vocab-change-cover-btn py-1.5 px-3 rounded-xl bg-white/95 text-slate-800 border border-amber-400/80 shadow-md text-xs font-bold flex items-center gap-1.5 hover:bg-white hover:scale-105 active:scale-95 transition"
            >
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              <span>Change Cover</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Bottom Controls: Two Balanced Action Pills */}
      <div className="vocab-card-bottom-bar flex items-center gap-2 mt-auto pt-2">
        {/* Flashcard Button */}
        <button
          type="button"
          onClick={() => onOpenFlashcards(list)}
          className="vocab-flashcard-pill flex-1 py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 bg-amber-50 border-amber-300/80 text-amber-800 hover:bg-amber-100/70 shadow-sm dark:bg-amber-400/15 dark:border-amber-400/40 dark:text-amber-300"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
          <span>Flashcards</span>
        </button>

        {/* Assign / Share Button */}
        {onAssignToClass && (
          <button
            type="button"
            onClick={() => onAssignToClass(list)}
            className="vocab-assign-pill flex-1 py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Assign</span>
          </button>
        )}
      </div>
    </article>
  );
};
