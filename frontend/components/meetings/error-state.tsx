'use client';

import React from 'react';
import { ExclamationCircleIcon, ArrowPathIcon } from '../ui/icons';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const MeetingErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to connect to the backend server. Please verify the API is running.',
  onRetry,
}) => {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 sm:p-12 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        <ExclamationCircleIcon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-100">Unable to load meetings</h3>
      <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
        {message}
      </p>
      <div className="mt-5">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 transition-all shadow-sm"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
};
