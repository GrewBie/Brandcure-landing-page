export type VideoProvider =
  | "youtube"
  | "vimeo"
  | "google-drive"
  | "file"
  | "none";

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

const GOOGLE_DRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/]+)/,
  /drive\.google\.com\/open\?id=([^&]+)/,
  /drive\.google\.com\/uc\?(?:export=(?:download|view)&)?id=([^&]+)/,
];

export function extractGoogleDriveFileId(
  rawUrl: string | null | undefined,
): string | undefined {
  const url = (rawUrl ?? "").trim();
  if (!url) return undefined;
  for (const pattern of GOOGLE_DRIVE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return undefined;
}

export function isIframeVideoProvider(
  provider: VideoProvider,
): provider is "youtube" | "vimeo" | "google-drive" {
  return (
    provider === "youtube" ||
    provider === "vimeo" ||
    provider === "google-drive"
  );
}

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

  const driveId = extractGoogleDriveFileId(url);
  if (driveId) {
    return {
      provider: "google-drive",
      url,
      id: driveId,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
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

/** Iframe src with autoplay; prefers unmuted when the provider allows it. */
export function videoEmbedAutoplaySrc(parsed: ParsedVideo): string | undefined {
  if (!parsed.embedUrl) return undefined;
  if (parsed.provider === "youtube") {
    const join = parsed.embedUrl.includes("?") ? "&" : "?";
    return `${parsed.embedUrl}${join}autoplay=1&mute=0&playsinline=1`;
  }
  if (parsed.provider === "vimeo") {
    const join = parsed.embedUrl.includes("?") ? "&" : "?";
    return `${parsed.embedUrl}${join}autoplay=1&muted=0`;
  }
  if (parsed.provider === "google-drive") {
    return parsed.embedUrl;
  }
  return parsed.embedUrl;
}
