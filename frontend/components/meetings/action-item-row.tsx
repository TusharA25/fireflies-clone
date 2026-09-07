'use client';

import React from 'react';
import { ActionItem } from '@/types';
import { CheckIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@/components/ui/icons';

interface ActionItemRowProps {
  item: ActionItem;
  isSaving: boolean;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDueDate(due: string | null | undefined): string | null {
  if (!due) return null;
  try {
    return new Date(due).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export function ActionItemRow({ item, isSaving, onToggleComplete, onEdit, onDelete }: ActionItemRowProps) {
  const dueDate = formatDueDate(item.due_date);
  const isOverdue =
    item.due_date && !item.completed && new Date(item.due_date) < new Date();

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border text-xs transition-all ${
        item.completed
          ? 'bg-zinc-950/30 border-zinc-800/50 opacity-60'
          : 'bg-zinc-950/60 border-zinc-800'
      }`}
    >
      {/* Completion toggle */}
      <button
        onClick={onToggleComplete}
        disabled={isSaving}
        aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
          item.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-transparent border-zinc-600 hover:border-emerald-500 text-transparent hover:text-emerald-500'
        } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isSaving ? (
          <ArrowPathIcon className="w-3 h-3 animate-spin text-zinc-400" />
        ) : (
          <CheckIcon className="w-3 h-3" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p
          className={`font-medium leading-snug ${
            item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
          }`}
        >
          {item.task}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
          {item.assignee && (
            <span>
              Assigned to{' '}
              <span className="font-semibold text-zinc-400">{item.assignee}</span>
            </span>
          )}
          {dueDate && (
            <span
              className={`${
                isOverdue ? 'text-rose-400 font-semibold' : 'text-zinc-500'
              }`}
            >
              {isOverdue ? '⚠ Overdue: ' : 'Due: '}
              {dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          disabled={isSaving}
          aria-label="Edit action item"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-zinc-600"
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          disabled={isSaving}
          aria-label="Delete action item"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-rose-600"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
