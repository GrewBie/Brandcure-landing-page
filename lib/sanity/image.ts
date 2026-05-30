import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max");
}

export function imageUrl(
  source: SanityImageSource | null | undefined,
  width: number,
) {
  if (!source) return "";
  return urlForImage(source).width(width).url();
}
