import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function EngagementCounts({
  likeCount,
  commentCount,
  className = "",
}: {
  likeCount: number;
  commentCount: number;
  className?: string;
}) {
  if (likeCount === 0 && commentCount === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-[11px] font-medium tracking-[0.04em] text-gray",
        className
      )}
    >
      {likeCount > 0 && (
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3.5 text-gold" aria-hidden />
          {likeCount}
        </span>
      )}
      {commentCount > 0 && (
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="size-3.5" aria-hidden />
          {commentCount}
        </span>
      )}
    </div>
  );
}
