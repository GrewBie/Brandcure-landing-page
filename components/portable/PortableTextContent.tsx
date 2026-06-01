import { urlForImage } from "@/lib/sanity/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";

type ImageValue = {
  asset?: { _ref?: string };
  alt?: string;
  caption?: string;
};

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 font-serif text-3xl font-medium tracking-[-0.02em] text-brand-black">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 font-serif text-2xl font-medium text-brand-black">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mb-5 text-base font-light leading-[1.8] text-gray">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-gold pl-6 font-serif text-xl italic text-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-5 list-disc space-y-2 pl-6 text-base font-light leading-[1.8] text-gray">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-5 list-decimal space-y-2 pl-6 text-base font-light leading-[1.8] text-gray">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-foreground underline underline-offset-4 hover:text-gold"
        target={value?.href?.startsWith("/") ? undefined : "_blank"}
        rel={value?.href?.startsWith("/") ? undefined : "noopener noreferrer"}
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const image = value as ImageValue | undefined;
      if (!image?.asset) return null;

      const src = urlForImage(image).width(1200).url();
      if (!src) return null;

      return (
        <figure className="my-10">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
            <Image
              src={src}
              alt={
                image.alt?.trim() ||
                (typeof image.caption === "string" && image.caption.trim()) ||
                "Illustration in article"
              }
              fill
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 900px"
            />
          </div>
          {image.caption && (
            <figcaption className="mt-3 text-center text-sm text-light-gray">
              {image.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export function PortableTextContent({
  value,
}: {
  value: PortableTextBlock[] | null | undefined;
}) {
  if (!value?.length) return null;
  return (
    <div className="prose-brand mt-10 max-w-none">
      <PortableText value={value} components={components} />
    </div>
  );
}
