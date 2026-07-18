import { normalizeBlog } from "@/lib/normalizers";
import BlogPostClient from "./BlogPostClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://d6mvnylha0j3u.cloudfront.net/api";
// Storefront origin, used only for canonical og:url. Optional: og:image is an
// absolute S3 URL, so previews work even when this is unset.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

// Server-side fetch of a published post (+ related). Plain fetch (not the axios
// client) so no cookie/refresh machinery runs during metadata generation.
// Returns { blog, relatedBlogs } or null.
async function getBlogData(slug) {
  try {
    const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

const SITE_NAME = "Cleanse Ayurveda";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogData(slug);
  const blog = data?.blog;

  if (!blog) {
    return { title: `Article Not Found | ${SITE_NAME}` };
  }

  // Prefer the admin-authored SEO fields, then fall back through the real
  // content — never a hardcoded blurb.
  const title = blog.seo?.metaTitle || blog.title;
  const description =
    blog.seo?.metaDescription || blog.excerpt || blog.summary || undefined;
  // og:image must be absolute; the stored value already is (S3/CloudFront).
  const image =
    typeof blog.image === "string" && /^https?:\/\//.test(blog.image)
      ? blog.image
      : null;
  const url = SITE_URL ? `${SITE_URL}/blog/${slug}` : undefined;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title,
      description,
      ...(url ? { url } : {}),
      ...(image ? { images: [{ url: image, alt: blog.title }] } : {}),
      ...(blog.publishedAt ? { publishedTime: blog.publishedAt } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const data = await getBlogData(slug);

  // Server didn't find the post: hand the client a confirmed-404 flag so it
  // renders the branded not-found view without a redundant re-fetch.
  if (!data?.blog) {
    return <BlogPostClient slug={slug} initialNotFound />;
  }

  return (
    <BlogPostClient
      slug={slug}
      initialBlog={normalizeBlog(data.blog)}
      initialRelated={(data.relatedBlogs || []).map(normalizeBlog)}
    />
  );
}
