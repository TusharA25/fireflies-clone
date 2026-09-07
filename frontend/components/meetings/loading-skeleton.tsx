'use client';

import React from 'react';

export const MeetingLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3" aria-label="Loading meetings" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4 sm:p-5 animate-pulse"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left skeleton */}
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-3">
                <div className="h-5 bg-zinc-800 rounded w-1/3 min-w-[140px]" />
                <div className="h-4 bg-zinc-800/60 rounded-full w-16" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3.5 bg-zinc-800/60 rounded w-24" />
                <div className="h-3.5 bg-zinc-800/60 rounded w-12" />
                <div className="h-3.5 bg-zinc-800/60 rounded w-16" />
              </div>
            </div>

            {/* Right skeleton */}
            <div className="flex items-center justify-between lg:justify-end gap-5">
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950" />
                <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950" />
                <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950" />
              </div>
              <div className="h-7 bg-zinc-800 rounded-lg w-16" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading meetings...</span>
    </div>
  );
};
