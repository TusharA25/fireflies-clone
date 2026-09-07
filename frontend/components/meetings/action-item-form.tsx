'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ActionItem, ActionItemCreateInput } from '@/types';
import { CheckIcon, XMarkIcon } from '@/components/ui/icons';

interface ActionItemFormProps {
  initialData?: ActionItem | null;
  onSave: (data: ActionItemCreateInput) => Promise<void>;
  onCancel: () => void;
}

export function ActionItemForm({ initialData, onSave, onCancel }: ActionItemFormProps) {
  const [task, setTask] = useState(initialData?.task ?? '');
  const [assignee, setAssignee] = useState(initialData?.assignee ?? '');
  const [dueDate, setDueDate] = useState(() => {
    if (!initialData?.due_date) return '';
    try {
      // Convert ISO datetime to date-only for input[type=date]
      return initialData.due_date.split('T')[0];
    } catch {
      return '';
    }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    taskRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTask = task.trim();
    if (!trimmedTask) {
      setError('Task description is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        task: trimmedTask,
        assignee: assignee.trim() || null,
        due_date: dueDate || null,
        completed: initialData?.completed ?? false,
      });
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-emerald-500/30 bg-zinc-950/70 p-3 space-y-2.5"
    >
      {/* Task */}
      <div>
        <label htmlFor="ai-task" className="sr-only">
          Task description
        </label>
        <input
          id="ai-task"
          ref={taskRef}
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe the action item…"
          disabled={saving}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-xs text-zinc-200 placeholder:text-zinc-500 px-3 py-2 outline-none disabled:opacity-60 transition-colors"
        />
      </div>

      {/* Assignee & Due Date row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="ai-assignee" className="sr-only">
            Assignee
          </label>
          <input
            id="ai-assignee"
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Assignee (optional)"
            disabled={saving}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-xs text-zinc-200 placeholder:text-zinc-500 px-3 py-2 outline-none disabled:opacity-60 transition-colors"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="ai-due" className="sr-only">
            Due date
          </label>
          <input
            id="ai-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={saving}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-xs text-zinc-200 px-3 py-2 outline-none disabled:opacity-60 transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-rose-400">{error}</p>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <CheckIcon className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : initialData ? 'Update' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 text-zinc-300 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </form>
  );
}
