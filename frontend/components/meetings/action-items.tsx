'use client';

import React, { useState } from 'react';
import { ActionItem, ActionItemCreateInput, ActionItemUpdateInput } from '@/types';
import { createActionItem, updateActionItem, deleteActionItem } from '@/lib/api/meetings';
import { ActionItemRow } from './action-item-row';
import { ActionItemForm } from './action-item-form';
import { DocumentTextIcon, PlusIcon } from '@/components/ui/icons';
import { useToast } from '@/components/ui/toast';

interface ActionItemsProps {
  meetingId: string;
  initialItems: ActionItem[];
  isLoading?: boolean;
}

export function ActionItems({ meetingId, initialItems, isLoading = false }: ActionItemsProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Keep items in sync if parent reloads data
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const completedCount = items.filter((i) => i.completed).length;

  const handleCreate = async (data: ActionItemCreateInput) => {
    try {
      const created = await createActionItem(meetingId, data);
      setItems((prev) => [...prev, created]);
      setShowForm(false);
      showToast('Action item added', 'success');
    } catch {
      showToast('Failed to add action item', 'error');
    }
  };

  const handleUpdate = async (aid: string, data: ActionItemUpdateInput) => {
    setSavingId(aid);
    try {
      const updated = await updateActionItem(meetingId, aid, data);
      setItems((prev) => prev.map((i) => (i.id === aid ? updated : i)));
      setEditingItem(null);
    } catch {
      showToast('Failed to update action item', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleComplete = async (item: ActionItem) => {
    await handleUpdate(item.id, { completed: !item.completed });
  };

  const handleDelete = async (aid: string) => {
    setSavingId(aid);
    try {
      await deleteActionItem(meetingId, aid);
      setItems((prev) => prev.filter((i) => i.id !== aid));
      showToast('Action item deleted', 'success');
    } catch {
      showToast('Failed to delete action item', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleEditSave = async (data: ActionItemCreateInput) => {
    if (!editingItem) return;
    await handleUpdate(editingItem.id, data);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 space-y-3 animate-pulse">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <div className="w-4 h-4 rounded bg-zinc-700" />
          <div className="w-28 h-4 rounded bg-zinc-700" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-850">
            <div className="w-5 h-5 rounded bg-zinc-700 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded bg-zinc-800 w-full" />
              <div className="h-2.5 rounded bg-zinc-800 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
        <DocumentTextIcon className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-white tracking-tight">
          Action Items
          {items.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-zinc-400">
              ({completedCount}/{items.length} done)
            </span>
          )}
        </h3>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors"
          aria-label="Add action item"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <ActionItemForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* List */}
      {items.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
          <DocumentTextIcon className="w-6 h-6 text-zinc-600" />
          <p className="text-xs text-zinc-500">No action items yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
          >
            Add one now
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) =>
            editingItem?.id === item.id ? (
              <ActionItemForm
                key={item.id}
                initialData={editingItem}
                onSave={handleEditSave}
                onCancel={() => setEditingItem(null)}
              />
            ) : (
              <ActionItemRow
                key={item.id}
                item={item}
                isSaving={savingId === item.id}
                onToggleComplete={() => handleToggleComplete(item)}
                onEdit={() => {
                  setShowForm(false);
                  setEditingItem(item);
                }}
                onDelete={() => handleDelete(item.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
