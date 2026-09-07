'use client';

import React, { useState, useEffect } from 'react';
import { MeetingSortOption } from '@/types';
import { SearchIcon, XMarkIcon, FilterIcon, CalendarIcon, UserIcon } from '../ui/icons';

export type DatePreset = 'all' | 'today' | '7days' | '30days';

interface MeetingFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  participantQuery: string;
  onParticipantChange: (p: string) => void;
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  sortOption: MeetingSortOption;
  onSortChange: (sort: MeetingSortOption) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export const MeetingFilters: React.FC<MeetingFiltersProps> = ({
  searchQuery,
  onSearchChange,
  participantQuery,
  onParticipantChange,
  datePreset,
  onDatePresetChange,
  sortOption,
  onSortChange,
  onResetFilters,
  isFiltered,
}) => {
  // Local state for debounced title search
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localParticipant, setLocalParticipant] = useState(participantQuery);

  // Sync external changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalParticipant(participantQuery);
  }, [participantQuery]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  // Debounce participant query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localParticipant !== participantQuery) {
        onParticipantChange(localParticipant);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localParticipant, participantQuery, onParticipantChange]);

  const datePresets: { label: string; value: DatePreset }[] = [
    { label: 'All Dates', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
  ];

  const sortOptions: { label: string; value: MeetingSortOption }[] = [
    { label: 'Most Recent', value: 'date_desc' },
    { label: 'Oldest First', value: 'date_asc' },
    { label: 'Title (A–Z)', value: 'title_asc' },
  ];

  return (
    <div className="space-y-3">
      {/* Top row: Search input + participant input + sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Title search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search meetings by title..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
            aria-label="Search meetings by title"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-200"
              aria-label="Clear title search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Participant search */}
        <div className="relative flex-1 md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <UserIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localParticipant}
            onChange={(e) => setLocalParticipant(e.target.value)}
            placeholder="Filter by participant..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
            aria-label="Filter by participant name"
          />
          {localParticipant && (
            <button
              onClick={() => {
                setLocalParticipant('');
                onParticipantChange('');
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-200"
              aria-label="Clear participant filter"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-select" className="text-xs text-zinc-400 hidden sm:inline">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as MeetingSortOption)}
            className="px-3 py-2 text-xs sm:text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 cursor-pointer"
            aria-label="Sort meetings"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom row: Date presets & clear active filters */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mr-1">
            <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
            Date:
          </span>
          {datePresets.map((preset) => {
            const isSelected = datePreset === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => onDatePresetChange(preset.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Clear filters pill */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-colors"
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
