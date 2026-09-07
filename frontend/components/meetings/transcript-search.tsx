'use client';

import React from 'react';
import {
  SearchIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../ui/icons';

interface TranscriptSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchCount: number;
  currentMatchIndex: number; // 0-based
  onNextMatch: () => void;
  onPrevMatch: () => void;
}

export const TranscriptSearch: React.FC<TranscriptSearchProps> = ({
  searchQuery,
  onSearchChange,
  matchCount,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevMatch();
      } else {
        onNextMatch();
      }
    } else if (e.key === 'Escape') {
      onSearchChange('');
    }
  };

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search transcript (Press Enter for next)..."
          className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
          aria-label="Search inside transcript"
        />
        {hasSearch && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-200"
            aria-label="Clear transcript search"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Match Count & Navigation Controls */}
      {hasSearch && (
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 px-1">
          <span className="text-xs font-mono font-medium text-zinc-400">
            {matchCount > 0 ? (
              <span>
                <span className="text-violet-300 font-bold">{currentMatchIndex + 1}</span> of{' '}
                <span className="text-zinc-200">{matchCount}</span> matches
              </span>
            ) : (
              <span className="text-zinc-500">0 matches</span>
            )}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={onPrevMatch}
              disabled={matchCount === 0}
              className="p-1.5 rounded-md text-zinc-300 hover:text-white bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous match (Shift + Enter)"
              aria-label="Previous match"
            >
              <ChevronUpIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNextMatch}
              disabled={matchCount === 0}
              className="p-1.5 rounded-md text-zinc-300 hover:text-white bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next match (Enter)"
              aria-label="Next match"
            >
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
