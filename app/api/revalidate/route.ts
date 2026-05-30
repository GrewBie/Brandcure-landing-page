import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (
    !process.env.SANITY_REVALIDATION_SECRET ||
    secret !== process.env.SANITY_REVALIDATION_SECRET
  ) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let body: { _type?: string; slug?: { current?: string } } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is ok — revalidate all */
  }

  const type = body._type;

  if (!type || type === "portfolioProject") {
    revalidateTag("portfolio", { expire: 0 });
    revalidatePath("/");
    if (body.slug?.current) {
      revalidatePath(`/portfolio/${body.slug.current}`);
    }
  }

  if (!type || type === "blogPost") {
    revalidateTag("blog", { expire: 0 });
    revalidatePath("/");
    if (body.slug?.current) {
      revalidatePath(`/blog/${body.slug.current}`);
    }
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
