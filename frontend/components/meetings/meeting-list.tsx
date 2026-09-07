'use client';

import React from 'react';
import { Meeting } from '@/types';
import { MeetingRow } from './meeting-row';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons';

interface MeetingListProps {
  meetings: Meeting[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onDeleteMeeting?: (id: string) => Promise<void>;
}

export const MeetingList: React.FC<MeetingListProps> = ({
  meetings,
  total,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onDeleteMeeting,
}) => {
  const startIdx = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-4">
      {/* Meta count bar */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
        <div>
          Showing <span className="font-semibold text-zinc-200">{startIdx}</span> to{' '}
          <span className="font-semibold text-zinc-200">{endIdx}</span> of{' '}
          <span className="font-semibold text-zinc-200">{total}</span> meetings
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-2.5">
        {meetings.map((meeting) => (
          <MeetingRow
            key={meeting.id}
            meeting={meeting}
            onDelete={onDeleteMeeting}
          />
        ))}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-850">
          <p className="text-xs text-zinc-400">
            Page <span className="font-semibold text-zinc-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-zinc-200">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Quick page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Only show around current page if many pages
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - currentPage) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span key={pageNum} className="px-1 text-zinc-600 text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-transparent'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
