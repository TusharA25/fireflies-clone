'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { TranscriptComment } from '@/types';
import { ChatBubbleIcon, TrashIcon, XMarkIcon } from '@/components/ui/icons';

interface TranscriptCommentsProps {
  comments: TranscriptComment[];
  isComposerOpen: boolean;
  isSubmitting: boolean;
  deletingId: string | null;
  onOpenComposer: () => void;
  onCloseComposer: () => void;
  onSubmit: (text: string, authorName: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

function formatCommentTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function TranscriptComments({
  comments,
  isComposerOpen,
  isSubmitting,
  deletingId,
  onOpenComposer,
  onCloseComposer,
  onSubmit,
  onDelete,
}: TranscriptCommentsProps) {
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const textId = useId();
  const authorId = useId();
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isComposerOpen) {
      textRef.current?.focus();
    } else {
      setText('');
      setAuthorName('');
      setLocalError(null);
    }
  }, [isComposerOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = text.trim();
    if (!trimmed) {
      setLocalError('Comment cannot be empty.');
      return;
    }
    setLocalError(null);
    try {
      await onSubmit(trimmed, authorName.trim());
      setText('');
      setAuthorName('');
    } catch {
      setLocalError('Failed to post comment. Please try again.');
    }
  };

  return (
    <div
      className="pt-2 space-y-2"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-zinc-500">
          {comments.length === 0
            ? 'No comments on this segment'
            : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isComposerOpen) {
              onCloseComposer();
            } else {
              onOpenComposer();
            }
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-violet-600/20 hover:border-violet-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 transition-colors"
          aria-expanded={isComposerOpen}
          aria-label={isComposerOpen ? 'Cancel comment' : 'Add comment on this segment'}
        >
          <ChatBubbleIcon className="w-3 h-3" />
          {isComposerOpen ? 'Cancel' : 'Comment'}
        </button>
      </div>

      {comments.map((comment) => (
        <article
          key={comment.id}
          className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-2.5 py-2 space-y-1"
          aria-label={`Comment by ${comment.author_name || 'Anonymous'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-zinc-200 truncate">
                {comment.author_name || 'Anonymous'}
              </p>
              {comment.created_at && (
                <p className="text-[10px] text-zinc-500">{formatCommentTime(comment.created_at)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void onDelete(comment.id);
              }}
              disabled={deletingId === comment.id}
              className="p-1 rounded-md text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:opacity-50"
              aria-label="Delete comment"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
        </article>
      ))}

      {isComposerOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-violet-500/30 bg-zinc-950/80 p-2.5 space-y-2"
        >
          <div>
            <label htmlFor={authorId} className="sr-only">
              Your name
            </label>
            <input
              id={authorId}
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name (optional)"
              disabled={isSubmitting}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 text-xs text-zinc-200 placeholder:text-zinc-500 px-2.5 py-1.5 outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor={textId} className="sr-only">
              Comment text
            </label>
            <textarea
              id={textId}
              ref={textRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  onCloseComposer();
                }
              }}
              placeholder="Add a comment on this segment…"
              disabled={isSubmitting}
              rows={2}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 text-xs text-zinc-200 placeholder:text-zinc-500 px-2.5 py-1.5 outline-none resize-y min-h-[56px] disabled:opacity-60"
            />
          </div>
          {localError && <p className="text-[11px] text-rose-400">{localError}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-2.5 py-1 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-[11px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              {isSubmitting ? 'Posting…' : 'Post comment'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCloseComposer();
              }}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            >
              <XMarkIcon className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
