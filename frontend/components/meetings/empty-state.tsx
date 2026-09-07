'use client';

import React from 'react';
import { SearchIcon, FolderIcon, PlusIcon, ArrowPathIcon } from '../ui/icons';

interface EmptyStateProps {
  type: 'no-meetings' | 'no-results';
  onAction?: () => void;
}

export const MeetingEmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  if (type === 'no-results') {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-10 sm:p-14 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-4">
          <SearchIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200">No matching meetings found</h3>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
          We could not find any meetings matching your current search terms or date filter.
        </p>
        {onAction && (
          <div className="mt-5">
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-all"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-10 sm:p-14 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
        <FolderIcon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-200">Your meeting library is empty</h3>
      <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
        Start by creating or scheduling a meeting to view transcripts, AI summaries, and action items.
      </p>
      {onAction && (
        <div className="mt-5">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create First Meeting</span>
          </button>
        </div>
      )}
    </div>
  );
};
