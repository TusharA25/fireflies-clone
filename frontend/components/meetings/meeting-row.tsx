'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Meeting } from '@/types';
import { ParticipantAvatars } from './participant-avatars';
import { CalendarIcon, ClockIcon, TrashIcon, ArrowRightIcon } from '../ui/icons';

interface MeetingRowProps {
  meeting: Meeting;
  onDelete?: (id: string) => Promise<void>;
}

function formatMeetingDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatMeetingTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export const MeetingRow: React.FC<MeetingRowProps> = ({ meeting, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    if (onDelete) {
      try {
        setIsDeleting(true);
        await onDelete(meeting.id);
      } finally {
        setIsDeleting(false);
        setShowConfirm(false);
      }
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const formattedDate = formatMeetingDate(meeting.date);
  const formattedTime = formatMeetingTime(meeting.date);
  const formattedDuration = formatDuration(meeting.duration_sec);

  return (
    <div className="group relative rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-violet-500/30 transition-all duration-150 p-4 sm:p-5 shadow-sm hover:shadow-md hover:shadow-violet-500/5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title + Date/Time + Duration + Tags */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start sm:items-center justify-between lg:justify-start gap-3">
            <Link
              href={`/meetings/${meeting.id}`}
              className="text-base font-semibold text-zinc-100 hover:text-violet-300 transition-colors truncate focus:outline-none focus:underline"
            >
              {meeting.title}
            </Link>

            {/* Status indicator */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                meeting.status === 'done'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : meeting.status === 'processing'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  meeting.status === 'done'
                    ? 'bg-emerald-400'
                    : meeting.status === 'processing'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-zinc-500'
                }`}
              />
              {meeting.status === 'done' ? 'Processed' : meeting.status}
            </span>
          </div>

          {/* Subtitle meta: Date, Time, Duration */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formattedDate}</span>
              {formattedTime && <span className="text-zinc-600">·</span>}
              {formattedTime && <span>{formattedTime}</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formattedDuration}</span>
            </div>

            {/* Tags */}
            {meeting.tags && meeting.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {meeting.tags.map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/80"
                    style={{
                      borderColor: tag.color ? `${tag.color}40` : undefined,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mr-1"
                      style={{ backgroundColor: tag.color || '#818cf8' }}
                    />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle/Right: Participants & Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-5 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800/60">
          {/* Participants */}
          <div className="shrink-0">
            <ParticipantAvatars participants={meeting.participants} maxDisplay={3} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {showConfirm ? (
              <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-rose-500/40">
                <span className="text-[11px] text-rose-400 px-1 font-medium">Delete?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
                  aria-label="Confirm delete"
                >
                  {isDeleting ? '...' : 'Yes'}
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-1.5 py-0.5 rounded text-zinc-400 hover:text-white text-xs"
                  aria-label="Cancel delete"
                >
                  No
                </button>
              </div>
            ) : (
              onDelete && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/60 transition-colors opacity-80 group-hover:opacity-100"
                  title="Delete meeting"
                  aria-label={`Delete meeting ${meeting.title}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )
            )}

            <Link
              href={`/meetings/${meeting.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-violet-600 hover:text-white border border-zinc-700/60 hover:border-violet-500 transition-all shadow-sm group/btn"
            >
              <span>View</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
