"use client";

import { getVisitorId } from "@/lib/engagement/visitor";
import type { ContentType } from "@/lib/engagement/types";
import { cn } from "@/lib/cn";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

function formatCommentDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EngagementPanel({
  contentType,
  contentId,
  initialLikeCount,
  initialCommentCount,
}: {
  contentType: ContentType;
  contentId: string;
  initialLikeCount: number;
  initialCommentCount: number;
}) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    const res = await fetch(
      `/api/engagement/comments?type=${contentType}&contentId=${encodeURIComponent(contentId)}`,
    );
    if (!res.ok) return;
    const data = (await res.json()) as { comments: Comment[] };
    setComments(data.comments);
    setCommentCount(data.comments.length);
    setCommentsLoaded(true);
  }, [contentType, contentId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;
    fetch(
      `/api/engagement/like?type=${contentType}&contentId=${encodeURIComponent(contentId)}&visitorId=${encodeURIComponent(visitorId)}`,
    )
      .then((res) => res.json())
      .then((data: { liked?: boolean }) => setLiked(Boolean(data.liked)))
      .catch(() => undefined);
  }, [contentType, contentId]);

  const toggleLike = async () => {
    setLikeLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engagement/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          visitorId: getVisitorId(),
        }),
      });
      const data = (await res.json()) as { liked?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update like");
        return;
      }
      const nowLiked = Boolean(data.liked);
      setLiked(nowLiked);
      setLikeCount((c) => Math.max(0, c + (nowLiked ? 1 : -1)));
    } catch {
      setError("Could not update like");
    } finally {
      setLikeLoading(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/engagement/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          authorName,
          body,
        }),
      });
      const data = (await res.json()) as {
        comment?: Comment;
        error?: string;
      };
      if (!res.ok || !data.comment) {
        setError(data.error ?? "Could not post comment");
        return;
      }
      setComments((prev) => [...prev, data.comment!]);
      setCommentCount((c) => c + 1);
      setBody("");
    } catch {
      setError("Could not post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 border-t border-[var(--border)] pt-10">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={toggleLike}
          disabled={likeLoading}
          className={cn(
            "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
            liked
              ? "border-gold bg-gold/10 text-charcoal"
              : "border-[var(--border-mid)] text-charcoal hover:border-gold",
          )}
          aria-pressed={liked}
        >
          <Heart
            className={cn("size-4", liked && "fill-gold text-gold")}
            aria-hidden
          />
          {likeCount} {likeCount === 1 ? "Like" : "Likes"}
        </button>
        <span className="inline-flex items-center gap-2 text-sm text-gray">
          <MessageCircle className="size-4" aria-hidden />
          {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10">
        <h2 className="font-serif text-2xl font-medium text-brand-black">
          Comments
        </h2>

        {!commentsLoaded && (
          <p className="mt-4 text-sm text-gray">Loading comments…</p>
        )}

        {commentsLoaded && comments.length === 0 && (
          <p className="mt-4 text-sm text-gray">
            Be the first to share your thoughts.
          </p>
        )}

        <ul className="mt-6 space-y-6">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-[var(--border)] bg-warm-white p-5"
            >
              <p className="text-[11px] font-bold tracking-[0.08em] text-gold">
                {c.authorName}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal">
                {c.body}
              </p>
              <time
                dateTime={c.createdAt}
                className="mt-3 block text-[11px] text-light-gray"
              >
                {formatCommentDate(c.createdAt)}
              </time>
            </li>
          ))}
        </ul>

        <form onSubmit={submitComment} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="comment-name"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-gray"
            >
              Name
            </label>
            <input
              id="comment-name"
              type="text"
              required
              maxLength={80}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-mid)] bg-warm-white px-4 py-3 text-sm text-brand-black outline-none focus:border-gold"
            />
          </div>
          <div>
            <label
              htmlFor="comment-body"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-gray"
            >
              Comment
            </label>
            <textarea
              id="comment-body"
              required
              rows={4}
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full resize-y rounded-lg border border-[var(--border-mid)] bg-warm-white px-4 py-3 text-sm text-brand-black outline-none focus:border-gold"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="size-4" aria-hidden />
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </form>
      </div>
    </div>
  );
}
