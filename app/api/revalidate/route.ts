import { revalidatePath, revalidateTag } from "next/cache";
import { PORTFOLIO_DOCUMENT_TYPES } from "@/lib/sanity/queries";
import { type NextRequest, NextResponse } from "next/server";

const PORTFOLIO_TYPES = new Set<string>(PORTFOLIO_DOCUMENT_TYPES);

function slugFromBody(body: {
  slug?: { current?: string } | string;
}): string | undefined {
  if (!body.slug) return undefined;
  if (typeof body.slug === "string") return body.slug;
  return body.slug.current;
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (
    !process.env.SANITY_REVALIDATION_SECRET ||
    secret !== process.env.SANITY_REVALIDATION_SECRET
  ) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let body: { _type?: string; slug?: { current?: string } | string } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is ok — revalidate all */
  }

  const type = body._type;
  const slug = slugFromBody(body);

  if (!type || PORTFOLIO_TYPES.has(type)) {
    revalidateTag("portfolio", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/portfolio");
    if (slug) {
      revalidatePath(`/portfolio/${slug}`);
    }
  }

  if (!type || type === "blogPost") {
    revalidateTag("blog", { expire: 0 });
    revalidatePath("/");
    if (slug) {
      revalidatePath(`/blog/${slug}`);
    }
  }

  return NextResponse.json({ revalidated: true, now: Date.now(), type });
}
