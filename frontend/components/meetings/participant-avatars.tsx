'use client';

import React from 'react';
import { Participant } from '@/types';

interface ParticipantAvatarsProps {
  participants: Participant[];
  maxDisplay?: number;
}

const AVATAR_COLORS = [
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const ParticipantAvatars: React.FC<ParticipantAvatarsProps> = ({
  participants = [],
  maxDisplay = 3,
}) => {
  if (!participants || participants.length === 0) {
    return <span className="text-xs text-zinc-500 italic">No participants</span>;
  }

  const visible = participants.slice(0, maxDisplay);
  const remaining = participants.length - maxDisplay;

  const namesList = participants.map((p) => p.name).join(', ');

  return (
    <div className="flex items-center gap-2 group" title={namesList}>
      <div className="flex -space-x-1.5 overflow-hidden py-0.5">
        {visible.map((participant) => {
          const colorClass = getColorForName(participant.name);
          return (
            <div
              key={participant.id || participant.name}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-bold ring-2 ring-zinc-950 select-none shadow-sm ${colorClass}`}
              title={participant.name}
            >
              {getInitials(participant.name)}
            </div>
          );
        })}

        {remaining > 0 && (
          <div
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-semibold text-zinc-300 ring-2 ring-zinc-950 select-none"
            title={`${remaining} more: ${participants.slice(maxDisplay).map((p) => p.name).join(', ')}`}
          >
            +{remaining}
          </div>
        )}
      </div>

      {/* Participant names text summary */}
      <span className="text-xs text-zinc-400 truncate max-w-[180px] sm:max-w-[220px]">
        {visible.map((p) => p.name).join(', ')}
        {remaining > 0 ? ` +${remaining}` : ''}
      </span>
    </div>
  );
};
