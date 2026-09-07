'use client';

import React from 'react';
import { MenuIcon, PlusIcon, ArrowPathIcon } from '../ui/icons';
import { useAuth } from '@/components/auth/auth-provider';

interface HeaderProps {
  onOpenSidebar: () => void;
  onNewMeeting: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onNewMeeting,
  onRefresh,
  isRefreshing = false,
}) => {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={logout}
          className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
          aria-label={`Sign out ${user?.display_name ?? ''}`}
        >
          Sign out
        </button>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="hidden sm:inline text-zinc-500">Workspace</span>
          <span className="hidden sm:inline text-zinc-600">/</span>
          <span className="font-semibold text-zinc-200">Meetings</span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80 transition-all disabled:opacity-50"
          title="Refresh meetings"
          aria-label="Refresh meetings"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
        </button>

        <button
          onClick={onNewMeeting}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-500/20 transition-all active:scale-95"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Meeting</span>
        </button>
      </div>
    </header>
  );
};
