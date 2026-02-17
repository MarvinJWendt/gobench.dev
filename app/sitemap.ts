import type { MetadataRoute } from "next";
import { getAllSlugs, getBenchmarkMeta } from "@/lib/benchmarks";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();

  // Only include non-hidden benchmarks in the sitemap
  const benchmarkEntries: MetadataRoute.Sitemap = slugs
    .filter((slug) => {
      const meta = getBenchmarkMeta(slug);
      return !meta.hidden;
    })
    .map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...benchmarkEntries,
  ];
}
