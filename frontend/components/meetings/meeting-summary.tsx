'use client';

import React from 'react';
import { Summary } from '@/types';
import { SparklesIcon, ArrowPathIcon } from '@/components/ui/icons';

interface MeetingSummaryProps {
  summary: Summary | null | undefined;
  isLoading?: boolean;
}

export function MeetingSummary({ summary, isLoading = false }: MeetingSummaryProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 space-y-3 animate-pulse">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <div className="w-4 h-4 rounded bg-zinc-700" />
          <div className="w-32 h-4 rounded bg-zinc-700" />
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded bg-zinc-800 w-full" />
          <div className="h-3 rounded bg-zinc-800 w-5/6" />
          <div className="h-3 rounded bg-zinc-800 w-4/6" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <SparklesIcon className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Executive Summary</h3>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
            AI Generated
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
          <ArrowPathIcon className="w-6 h-6 text-zinc-600" />
          <p className="text-xs text-zinc-500">No summary available for this meeting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
        <SparklesIcon className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-white tracking-tight">Executive Summary</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
          AI Generated
        </span>
      </div>

      {/* Overview */}
      <p className="text-xs text-zinc-300 leading-relaxed">{summary.overview}</p>

      {/* Key Topics */}
      {summary.key_topics && summary.key_topics.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Key Topics</span>
          <div className="flex flex-wrap gap-1.5">
            {summary.key_topics.map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
