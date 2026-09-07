'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { TranscriptSegment as SegmentType, Participant } from '@/types';
import { TranscriptSearch } from './transcript-search';
import { TranscriptSegmentItem } from './transcript-segment';
import { DocumentTextIcon, ArrowPathIcon } from '../ui/icons';

interface TranscriptViewerProps {
  segments: SegmentType[];
  participants: Participant[];
  currentTime: number; // in seconds
  onSeek: (seconds: number) => void;
  isLoading?: boolean;
}

interface SearchMatch {
  segmentId: string;
  segmentIndex: number;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  segments = [],
  participants = [],
  currentTime,
  onSeek,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Map participant_id -> participant name
  const participantMap = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((p) => {
      map.set(p.id, p.name);
    });
    return map;
  }, [participants]);

  // Determine active segment based on currentTime in ms
  const currentMs = currentTime * 1000;
  const activeSegmentIndex = useMemo(() => {
    if (!segments || segments.length === 0) return -1;

    // Check if within any segment's [start_ms, end_ms]
    const exactIndex = segments.findIndex(
      (s) => currentMs >= s.start_ms && currentMs <= s.end_ms
    );
    if (exactIndex !== -1) return exactIndex;

    // If between segments or after, find the latest segment that started before or at currentMs
    let bestIndex = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].start_ms <= currentMs) {
        bestIndex = i;
      } else {
        break;
      }
    }
    return bestIndex !== -1 ? bestIndex : 0;
  }, [segments, currentMs]);

  // Compute all matches for search query
  const searchMatches = useMemo<SearchMatch[]>(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    const matches: SearchMatch[] = [];

    segments.forEach((seg, idx) => {
      const text = seg.text.toLowerCase();
      let pos = text.indexOf(query);
      while (pos !== -1) {
        matches.push({
          segmentId: seg.id,
          segmentIndex: idx,
        });
        pos = text.indexOf(query, pos + query.length);
      }
    });

    return matches;
  }, [segments, searchQuery]);

  // Reset or constrain currentMatchIndex when searchMatches change
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchMatches.length, searchQuery]);

  // Scroll to search match helper
  const scrollToMatch = useCallback((index: number) => {
    if (!searchMatches[index]) return;
    const match = searchMatches[index];
    const el = document.getElementById(`transcript-segment-${match.segmentId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchMatches]);

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const next = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(next);
    scrollToMatch(next);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prev = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prev);
    scrollToMatch(prev);
  };

  // Auto-scroll when active segment changes (if autoScroll is enabled)
  useEffect(() => {
    if (!autoScroll || activeSegmentIndex === -1 || !segments[activeSegmentIndex]) return;

    // Don't auto-scroll if user is actively searching
    if (searchQuery.trim().length > 0) return;

    const activeSeg = segments[activeSegmentIndex];
    const el = document.getElementById(`transcript-segment-${activeSeg.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSegmentIndex, autoScroll, segments, searchQuery]);

  const handleSeekToSegment = (startSeconds: number) => {
    onSeek(startSeconds);
  };

  const activeMatchedSegmentId = searchMatches[currentMatchIndex]?.segmentId;

  return (
    <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800/80 p-4 sm:p-6 space-y-4">
      {/* Transcript Header with Search & Auto-Scroll toggle */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Interactive Transcript
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-850 text-zinc-400 font-mono font-medium">
              {segments.length} segments
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span>Auto-scroll</span>
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <TranscriptSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          matchCount={searchMatches.length}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
        />
      </div>

      {/* Transcript Content List */}
      <div
        ref={containerRef}
        className="max-h-[600px] overflow-y-auto pr-1 sm:pr-2 space-y-2.5 focus:outline-none"
        tabIndex={0}
        role="region"
        aria-label="Transcript content"
      >
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-violet-400" />
            <p className="text-xs text-zinc-400">Loading transcript segments...</p>
          </div>
        ) : segments.length === 0 ? (
          <div className="py-14 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 p-8 space-y-2">
            <DocumentTextIcon className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No Transcript Available</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              This meeting does not have any recorded transcript segments yet.
            </p>
          </div>
        ) : (
          segments.map((segment, index) => {
            const speaker =
              (segment.participant_id && participantMap.get(segment.participant_id)) ||
              `Speaker ${index + 1}`;
            const isActive = index === activeSegmentIndex;
            const isCurrentMatch = segment.id === activeMatchedSegmentId;

            return (
              <TranscriptSegmentItem
                key={segment.id}
                segment={segment}
                speakerName={speaker}
                isActive={isActive}
                onSeekToSegment={handleSeekToSegment}
                searchQuery={searchQuery}
                isCurrentMatchSegment={isCurrentMatch}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
