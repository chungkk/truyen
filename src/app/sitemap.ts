import type { MetadataRoute } from "next";
import { getAllStories } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const stories = getAllStories();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/danh-muc`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${siteUrl}/truyen/${encodeURIComponent(story.slug)}`,
    changeFrequency: story.status === "Hoàn thành" ? "monthly" : "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...storyRoutes];
}
