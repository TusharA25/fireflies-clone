'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getMeetings, deleteMeeting } from '@/lib/api/meetings';
import { checkHealth } from '@/lib/api/health';
import { Meeting, MeetingSortOption } from '@/types';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MeetingFilters, DatePreset } from '@/components/meetings/meeting-filters';
import { MeetingList } from '@/components/meetings/meeting-list';
import { MeetingLoadingSkeleton } from '@/components/meetings/loading-skeleton';
import { MeetingEmptyState } from '@/components/meetings/empty-state';
import { MeetingErrorState } from '@/components/meetings/error-state';
import { CreateMeetingModal } from '@/components/meetings/create-meeting-modal';
import { useToast } from '@/components/ui/toast';
import { SparklesIcon, ClockIcon, UsersIcon, FolderIcon, PlusIcon } from '@/components/ui/icons';

export default function DashboardPage() {
  const { showToast } = useToast();

  // State
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [participantQuery, setParticipantQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [sortOption, setSortOption] = useState<MeetingSortOption>('date_desc');

  // Status & Modals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Health ping
  useEffect(() => {
    async function ping() {
      try {
        await checkHealth();
        setApiConnected(true);
      } catch {
        setApiConnected(false);
      }
    }
    ping();
  }, []);

  // Compute ISO date range from datePreset
  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();
    if (datePreset === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { dateFrom: startOfToday.toISOString(), dateTo: now.toISOString() };
    }
    if (datePreset === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { dateFrom: past.toISOString(), dateTo: now.toISOString() };
    }
    if (datePreset === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { dateFrom: past.toISOString(), dateTo: now.toISOString() };
    }
    return { dateFrom: undefined, dateTo: undefined };
  }, [datePreset]);

  // Load meetings
  const fetchMeetings = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setIsRefreshing(true);
        else setLoading(true);
        setError(null);

        const res = await getMeetings({
          page,
          size: pageSize,
          q: searchQuery || undefined,
          participant: participantQuery || undefined,
          date_from: dateFrom,
          date_to: dateTo,
          sort: sortOption,
        });

        setMeetings(res.items || []);
        setTotal(res.total || 0);
        setTotalPages(res.pages || 1);
        setApiConnected(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load meetings';
        setError(msg);
        setApiConnected(false);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, pageSize, searchQuery, participantQuery, dateFrom, dateTo, sortOption]
  );

  // Fetch when dependencies change
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Reset page to 1 when filters change
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handleParticipantChange = (p: string) => {
    setParticipantQuery(p);
    setPage(1);
  };

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    setPage(1);
  };

  const handleSortChange = (sort: MeetingSortOption) => {
    setSortOption(sort);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setParticipantQuery('');
    setDatePreset('all');
    setSortOption('date_desc');
    setPage(1);
  };

  const isFiltered = Boolean(
    searchQuery.trim() || participantQuery.trim() || datePreset !== 'all' || sortOption !== 'date_desc'
  );

  // Deletion
  const handleDeleteMeeting = async (id: string) => {
    try {
      await deleteMeeting(id);
      showToast('Meeting deleted successfully', 'info');
      // Refresh list
      fetchMeetings();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete meeting';
      showToast(msg, 'error');
    }
  };

  // Quick stats computed from current view
  const stats = useMemo(() => {
    let totalSec = 0;
    const participantsSet = new Set<string>();

    meetings.forEach((m) => {
      if (m.duration_sec) totalSec += m.duration_sec;
      m.participants?.forEach((p) => {
        if (p.name) participantsSet.add(p.name);
      });
    });

    const hours = (totalSec / 3600).toFixed(1);
    return {
      totalHours: hours,
      uniqueParticipants: participantsSet.size,
    };
  }, [meetings]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row text-zinc-100 antialiased">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        totalMeetings={total}
        apiConnected={apiConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onNewMeeting={() => setIsCreateModalOpen(true)}
          onRefresh={() => fetchMeetings(true)}
          isRefreshing={isRefreshing}
        />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Hero Banner / Title Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <span>Meetings Library</span>
                <span className="text-xs px-2.5 py-0.5 font-medium rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {total} {total === 1 ? 'Meeting' : 'Meetings'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Search, filter, and review smart meeting notes, transcripts, and action items.
              </p>
            </div>

            {/* Quick action button on wide screens */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 transition-all active:scale-95"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Meeting</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <FolderIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Total Recorded</p>
                <p className="text-lg font-bold text-white">{total} Meetings</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Page Audio Duration</p>
                <p className="text-lg font-bold text-white">{stats.totalHours} hrs</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <UsersIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Active Participants</p>
                <p className="text-lg font-bold text-white">{stats.uniqueParticipants} Members</p>
              </div>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <section
            aria-label="Meeting search and filters"
            className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 shadow-sm space-y-3"
          >
            <MeetingFilters
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              participantQuery={participantQuery}
              onParticipantChange={handleParticipantChange}
              datePreset={datePreset}
              onDatePresetChange={handleDatePresetChange}
              sortOption={sortOption}
              onSortChange={handleSortChange}
              onResetFilters={handleResetFilters}
              isFiltered={isFiltered}
            />
          </section>

          {/* Main List / State Rendering */}
          <section aria-label="Meetings list" className="space-y-4">
            {loading ? (
              <MeetingLoadingSkeleton count={5} />
            ) : error ? (
              <MeetingErrorState
                message={error}
                onRetry={() => fetchMeetings(true)}
              />
            ) : meetings.length === 0 ? (
              isFiltered ? (
                <MeetingEmptyState
                  type="no-results"
                  onAction={handleResetFilters}
                />
              ) : (
                <MeetingEmptyState
                  type="no-meetings"
                  onAction={() => setIsCreateModalOpen(true)}
                />
              )
            ) : (
              <MeetingList
                meetings={meetings}
                total={total}
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
                onDeleteMeeting={handleDeleteMeeting}
              />
            )}
          </section>
        </main>
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMeetingCreated={() => {
          fetchMeetings();
        }}
      />
    </div>
  );
}
