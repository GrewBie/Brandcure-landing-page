export type VideoProvider = "youtube" | "vimeo" | "file" | "none";

export type ParsedVideo = {
  provider: VideoProvider;
  /** Original URL as provided. */
  url: string;
  /** Provider video id (youtube/vimeo) when resolvable. */
  id?: string;
  /** Ready-to-use iframe src for youtube/vimeo. */
  embedUrl?: string;
};

const YOUTUBE_PATTERNS = [
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/(?:watch\?v=|embed\/|shorts\/)([\w-]{11})/,
  /youtube\.com\/.*[?&]v=([\w-]{11})/,
];

const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;

export function parseVideoUrl(rawUrl: string | null | undefined): ParsedVideo {
  const url = (rawUrl ?? "").trim();
  if (!url) return { provider: "none", url: "" };

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      const id = match[1];
      return {
        provider: "youtube",
        url,
        id,
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      };
    }
  }

  const vimeo = url.match(VIMEO_PATTERN);
  if (vimeo?.[1]) {
    const id = vimeo[1];
    return {
      provider: "vimeo",
      url,
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
    };
  }

  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)) {
    return { provider: "file", url };
  }

  // Unknown but present — treat as embeddable link best-effort.
  return { provider: "none", url };
}

export function getVideoProvider(url: string | null | undefined): VideoProvider {
  return parseVideoUrl(url).provider;
}
