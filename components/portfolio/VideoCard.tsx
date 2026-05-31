"use client";

import { browserNav } from "@/lib/browser-navigator";
import { cn } from "@/lib/cn";
import { parseVideoUrl } from "@/lib/video/embed";
import { videoDomId } from "@/lib/portfolio-nav";
import type { NavigatorSection } from "@/types/navigator";
import type { PortfolioProject } from "@/types/content";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  project: PortfolioProject;
  section: NavigatorSection;
  index: number;
  videoUrl: string;
};

export function VideoCard({ project, section, index, videoUrl }: Props) {
  const parsed = parseVideoUrl(videoUrl);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = useCallback(() => {
    setPlaying(true);
    if (parsed.provider === "file") {
      requestAnimationFrame(() => void videoRef.current?.play().catch(() => {}));
    }
  }, [parsed.provider]);

  const pause = useCallback(() => {
    if (parsed.provider === "file") videoRef.current?.pause();
    setPlaying(false);
  }, [parsed.provider]);

  useEffect(() => {
    return browserNav.registerPlayer(project.slug, { play, pause });
  }, [project.slug, play, pause]);

  const toggleNativePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  return (
    <article
      id={videoDomId(project.slug)}
      data-nav-id={project.slug}
      data-nav-section={section}
      data-nav-index={index}
      data-nav-title={project.title}
      data-nav-result={project.resultHeadline}
      data-nav-industry={project.segmentLabel}
      className="group flex flex-col overflow-hidden rounded-[14px] border border-[var(--border)] bg-warm-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      <div className="relative aspect-video overflow-hidden bg-charcoal">
        {!playing && (
          <>
            {project.heroImageUrl && (
              <Image
                src={project.heroImageUrl}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <button
              type="button"
              onClick={play}
              aria-label={`Play ${project.title}`}
              className="absolute inset-0 flex items-center justify-center bg-[rgba(17,18,20,0.28)] transition-colors hover:bg-[rgba(17,18,20,0.42)]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                ▶
              </span>
            </button>
          </>
        )}

        {playing && parsed.provider === "file" && (
          <video
            ref={videoRef}
            src={parsed.url}
            muted={muted}
            playsInline
            onTimeUpdate={onTimeUpdate}
            onClick={toggleNativePlay}
            className="h-full w-full object-contain"
          />
        )}

        {playing &&
          (parsed.provider === "youtube" || parsed.provider === "vimeo") && (
            <iframe
              src={`${parsed.embedUrl}${parsed.provider === "youtube" ? "&autoplay=1" : "?autoplay=1"}`}
              title={project.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          )}

        {playing && parsed.provider === "file" && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent px-3 py-2">
            <button
              type="button"
              onClick={toggleNativePlay}
              className="text-sm text-white"
              aria-label="Play or pause"
            >
              ⏯
            </button>
            <div
              className="relative h-1 flex-1 cursor-pointer rounded-full bg-[rgba(255,255,255,0.3)]"
              onClick={seek}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="text-sm text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gold">
          {project.segmentLabel}
        </p>
        <h3 className="mt-1.5 font-serif text-[22px] font-medium leading-tight text-brand-black">
          {project.title}
        </h3>
        <p data-nav-summary className="mt-1 text-xs text-gray">
          {project.subtitle}
        </p>
        <p className="mt-3 font-serif text-lg text-charcoal">
          {project.resultHeadline}
        </p>
        {(project.serviceType === "ai-ads" &&
          (project.adDescription || project.resultDetail)) && (
          <p className="mt-2 text-sm leading-relaxed text-gray">
            {project.adDescription || project.resultDetail}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {[
            project.automationSubtypeLabel ?? project.serviceTypeLabel,
            ...project.tags,
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[rgba(42,44,48,0.07)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] text-charcoal"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/portfolio/${project.slug}`}
          className={cn(
            "mt-4 inline-flex items-center text-[12px] font-semibold text-charcoal hover:text-gold",
          )}
        >
          View full case study →
        </Link>
      </div>
    </article>
  );
}
